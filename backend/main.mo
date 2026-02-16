import Array "mo:core/Array";
import Time "mo:core/Time";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import Storage "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";

actor {
  let folders = Map.empty<FolderId, Folder>();
  let files = Map.empty<FileId, File>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  var accessControlInitialized = false;

  type FileId = Text;
  type FolderId = Text;

  // Authentication system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Persistent storage system
  include MixinStorage();

  public type UserProfile = {
    username : Text;
    createdAt : Time.Time;
  };

  type Metadata = {
    name : Text;
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };

  type File = {
    id : FileId;
    blob : Storage.ExternalBlob;
    size : Nat;
    extension : Text;
    parentId : ?FolderId;
    metadata : Metadata;
    owner : Principal;
  };

  type Folder = {
    id : FolderId;
    parentId : ?FolderId;
    metadata : Metadata;
    owner : Principal;
  };

  type DriveContents = {
    folders : [Folder];
    files : [File];
  };

  //---------------------------------------------------------------------------
  // User Profile Management
  //---------------------------------------------------------------------------
  public shared ({ caller }) func initializeSystem() : async () {
    switch (accessControlInitialized, AccessControl.getUserRole(accessControlState, caller)) {
      case (false, #admin) {
        accessControlInitialized := true;
        Runtime.trap("System initialized. You are now the admin.");
      };
      case (true, #admin) {
        Runtime.trap("System already initialized. You should be an admin!");
      };
      case (false, _) {
        Runtime.trap("First user will be admin. Please try again.");
      };
      case (true, _) {
        Runtime.trap("System already initialized. Call failed");
      };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func signUp(username : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can sign up");
    };

    switch (userProfiles.get(caller)) {
      case (?_) { Runtime.trap("User already exists") };
      case (null) {
        let profile : UserProfile = {
          username;
          createdAt = Time.now();
        };
        userProfiles.add(caller, profile);
      };
    };
  };

  public query ({ caller }) func getUsername() : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Please sign in first");
    };

    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Unauthorized: Please sign up first") };
      case (?profile) { return profile.username };
    };
  };

  public query ({ caller }) func getDriveContents(parentId : ?FolderId) : async DriveContents {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Not signed in");
    };

    switch (parentId) {
      case (?pid) {
        switch (folders.get(pid)) {
          case (null) { Runtime.trap("Parent folder not found") };
          case (?folder) {
            if (folder.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("Unauthorized: Cannot access folder you don't own");
            };
          };
        };
      };
      case (null) { /* Root folder */ };
    };

    let accessibleFiles = files.values().filter(func(file) {
      file.parentId == parentId and (file.owner == caller or AccessControl.isAdmin(accessControlState, caller))
    }).toArray();

    let accessibleFolders = folders.values().filter(func(folder) {
      folder.parentId == parentId and (folder.owner == caller or AccessControl.isAdmin(accessControlState, caller))
    }).toArray();

    {
      files = accessibleFiles;
      folders = accessibleFolders;
    };
  };

  //---------------------------------------------------------------------------
  // File Management
  //---------------------------------------------------------------------------
  public shared ({ caller }) func uploadFile(
    name : Text,
    parentId : ?FolderId,
    blob : Storage.ExternalBlob,
    extension : Text,
    size : Nat,
  ) : async FileId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can upload files");
    };

    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Unauthorized: Please sign up first") };
      case (?_) {
        switch (parentId) {
          case (?pid) {
            switch (folders.get(pid)) {
              case (null) { Runtime.trap("Parent folder not found") };
              case (?folder) {
                if (folder.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
                  Runtime.trap("Unauthorized: Cannot upload to folder you don't own");
                };
              };
            };
          };
          case (null) { /* Root folder, no parent check needed */ };
        };

        let id = generateId();
        let timestamp = Time.now();
        let metadata : Metadata = {
          name;
          createdAt = timestamp;
          updatedAt = timestamp;
        };

        let file : File = {
          id;
          blob;
          metadata;
          parentId;
          extension;
          size;
          owner = caller;
        };

        files.add(id, file);
        id;
      };
    };
  };

  public query ({ caller }) func getFile(fileId : FileId) : async File {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view files");
    };

    switch (files.get(fileId)) {
      case (null) { Runtime.trap("File not found") };
      case (?file) {
        if (file.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Cannot access file you don't own");
        };
        file;
      };
    };
  };

  public shared ({ caller }) func moveFile(fileId : FileId, newParentId : ?FolderId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can move files");
    };

    switch (files.get(fileId)) {
      case (null) { Runtime.trap("File not found") };
      case (?file) {
        if (file.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Cannot move file you don't own");
        };

        switch (newParentId) {
          case (?pid) {
            switch (folders.get(pid)) {
              case (null) { Runtime.trap("Target folder not found") };
              case (?folder) {
                if (folder.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
                  Runtime.trap("Unauthorized: Cannot move to folder you don't own");
                };
              };
            };
          };
          case (null) { /* Moving to root folder */ };
        };

        let updatedMetadata = {
          file.metadata with
          updatedAt = Time.now();
        };
        let updatedFile = { file with parentId = newParentId; metadata = updatedMetadata };
        files.add(file.id, updatedFile);
      };
    };
  };

  public shared ({ caller }) func renameFile(fileId : FileId, newName : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can rename files");
    };

    switch (files.get(fileId)) {
      case (null) { Runtime.trap("File not found") };
      case (?file) {
        if (file.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Cannot rename file you don't own");
        };

        let updatedMetadata = {
          file.metadata with
          name = newName;
          updatedAt = Time.now();
        };
        let updatedFile = { file with metadata = updatedMetadata };
        files.add(file.id, updatedFile);
      };
    };
  };

  public shared ({ caller }) func deleteFile(fileId : FileId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete files");
    };

    switch (files.get(fileId)) {
      case (null) { Runtime.trap("File not found") };
      case (?file) {
        if (file.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Cannot delete file you don't own");
        };

        files.remove(file.id);
      };
    };
  };

  //---------------------------------------------------------------------------
  // Folder Management
  //---------------------------------------------------------------------------
  public shared ({ caller }) func createFolder(name : Text, parentId : ?FolderId) : async FolderId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create folders");
    };

    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Unauthorized: Please sign up first") };
      case (?_) {
        switch (parentId) {
          case (?pid) {
            switch (folders.get(pid)) {
              case (null) { Runtime.trap("Parent folder not found") };
              case (?folder) {
                if (folder.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
                  Runtime.trap("Unauthorized: Cannot create folder in folder you don't own");
                };
              };
            };
          };
          case (null) { /* Root folder, no parent check needed */ };
        };

        let id = generateId();
        let timestamp = Time.now();

        let metadata : Metadata = {
          name;
          createdAt = timestamp;
          updatedAt = timestamp;
        };

        let folder : Folder = {
          id;
          metadata;
          parentId;
          owner = caller;
        };

        folders.add(id, folder);
        id;
      };
    };
  };

  public query ({ caller }) func getFolder(folderId : FolderId) : async Folder {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view folders");
    };

    switch (folders.get(folderId)) {
      case (null) { Runtime.trap("Folder not found") };
      case (?folder) {
        if (folder.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Cannot access folder you don't own");
        };
        folder;
      };
    };
  };

  public shared ({ caller }) func renameFolder(folderId : FolderId, newName : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can rename folders");
    };

    switch (folders.get(folderId)) {
      case (null) { Runtime.trap("Folder not found") };
      case (?folder) {
        if (folder.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Cannot rename folder you don't own");
        };

        let updatedMetadata = {
          folder.metadata with
          name = newName;
          updatedAt = Time.now();
        };
        let updatedFolder = { folder with metadata = updatedMetadata };
        folders.add(folder.id, updatedFolder);
      };
    };
  };

  public shared ({ caller }) func deleteFolder(folderId : FolderId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete folders");
    };

    switch (folders.get(folderId)) {
      case (null) { Runtime.trap("Folder not found") };
      case (?folder) {
        if (folder.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Cannot delete folder you don't own");
        };

        let folderFiles = files.values().filter(func(file) { file.parentId == ?folderId }).toArray();
        for (file in folderFiles.vals()) {
          files.remove(file.id);
        };

        let subfolders = folders.values().filter(func(f) {
          switch (f.parentId) {
            case (?pid) { pid == folderId };
            case (null) { false };
          };
        }).toArray();

        for (subfolder in subfolders.vals()) {
          await deleteFolder(subfolder.id);
        };

        folders.remove(folderId);
      };
    };
  };

  public query ({ caller }) func findFilesInFolder(folderId : ?FolderId) : async [File] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list files");
    };

    switch (folderId) {
      case (?pid) {
        switch (folders.get(pid)) {
          case (null) { Runtime.trap("Folder not found") };
          case (?folder) {
            if (folder.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("Unauthorized: Cannot access folder you don't own");
            };
          };
        };
      };
      case (null) { /* Root folder */ };
    };

    files.values().filter(func(file) {
      file.parentId == folderId and (file.owner == caller or AccessControl.isAdmin(accessControlState, caller))
    }).toArray();
  };

  public query ({ caller }) func findFoldersInFolder(parentId : ?FolderId) : async [Folder] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list folders");
    };

    switch (parentId) {
      case (?pid) {
        switch (folders.get(pid)) {
          case (null) { Runtime.trap("Parent folder not found") };
          case (?folder) {
            if (folder.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("Unauthorized: Cannot access folder you don't own");
            };
          };
        };
      };
      case (null) { /* Root level, no parent check */ };
    };

    folders.values().filter(func(folder) {
      folder.parentId == parentId and (folder.owner == caller or AccessControl.isAdmin(accessControlState, caller))
    }).toArray();
  };

  public query ({ caller }) func getUserFiles() : async [File] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list their files");
    };

    files.values().filter(func(file) { file.owner == caller }).toArray();
  };

  public query ({ caller }) func getUserFolders() : async [Folder] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list their folders");
    };

    folders.values().filter(func(folder) { folder.owner == caller }).toArray();
  };

  //---------------------------------------------------------------------------
  // Helper Functions
  //---------------------------------------------------------------------------
  func generateId() : Text {
    Time.now().toText();
  };
};
