import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDriveActor } from './useDriveActor';
import type { UserProfile, Folder, File, FolderId, FileId } from '../backend';
import { ExternalBlob } from '../backend';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isReady } = useDriveActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: isReady,
    retry: false,
  });

  return {
    ...query,
    isLoading: !isReady || query.isLoading,
    isFetched: isReady && query.isFetched,
  };
}

export function useSaveUserProfile() {
  const { actor } = useDriveActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Connection not ready');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useSignUp() {
  const { actor } = useDriveActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (username: string) => {
      if (!actor) throw new Error('Connection not ready');
      return actor.signUp(username);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Folder Queries
export function useGetUserFolders() {
  const { actor, isReady } = useDriveActor();

  return useQuery<Folder[]>({
    queryKey: ['userFolders'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserFolders();
    },
    enabled: isReady,
  });
}

export function useGetFoldersInFolder(parentId: FolderId | null) {
  const { actor, isReady } = useDriveActor();

  const query = useQuery<Folder[]>({
    queryKey: ['foldersInFolder', parentId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.findFoldersInFolder(parentId);
    },
    enabled: isReady,
    retry: 1,
  });

  return {
    ...query,
    isLoading: !isReady || query.isLoading,
  };
}

export function useCreateFolder() {
  const { actor } = useDriveActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, parentId }: { name: string; parentId: FolderId | null }) => {
      if (!actor) throw new Error('Connection not ready');
      return actor.createFolder(name, parentId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['foldersInFolder', variables.parentId] });
      queryClient.invalidateQueries({ queryKey: ['userFolders'] });
    },
  });
}

export function useRenameFolder() {
  const { actor } = useDriveActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ folderId, newName }: { folderId: FolderId; newName: string }) => {
      if (!actor) throw new Error('Connection not ready');
      return actor.renameFolder(folderId, newName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foldersInFolder'] });
      queryClient.invalidateQueries({ queryKey: ['userFolders'] });
    },
  });
}

export function useDeleteFolder() {
  const { actor } = useDriveActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (folderId: FolderId) => {
      if (!actor) throw new Error('Connection not ready');
      return actor.deleteFolder(folderId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foldersInFolder'] });
      queryClient.invalidateQueries({ queryKey: ['filesInFolder'] });
      queryClient.invalidateQueries({ queryKey: ['userFolders'] });
      queryClient.invalidateQueries({ queryKey: ['userFiles'] });
    },
  });
}

// File Queries
export function useGetFilesInFolder(folderId: FolderId | null) {
  const { actor, isReady } = useDriveActor();

  const query = useQuery<File[]>({
    queryKey: ['filesInFolder', folderId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.findFilesInFolder(folderId);
    },
    enabled: isReady,
    retry: 1,
  });

  return {
    ...query,
    isLoading: !isReady || query.isLoading,
  };
}

export function useUploadFile() {
  const { actor } = useDriveActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      parentId,
      blob,
      extension,
      size,
    }: {
      name: string;
      parentId: FolderId | null;
      blob: ExternalBlob;
      extension: string;
      size: bigint;
    }) => {
      if (!actor) throw new Error('Connection not ready');
      return actor.uploadFile(name, parentId, blob, extension, size);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['filesInFolder', variables.parentId] });
      queryClient.invalidateQueries({ queryKey: ['userFiles'] });
    },
  });
}

export function useRenameFile() {
  const { actor } = useDriveActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ fileId, newName }: { fileId: FileId; newName: string }) => {
      if (!actor) throw new Error('Connection not ready');
      return actor.renameFile(fileId, newName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['filesInFolder'] });
      queryClient.invalidateQueries({ queryKey: ['userFiles'] });
    },
  });
}

export function useDeleteFile() {
  const { actor } = useDriveActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fileId: FileId) => {
      if (!actor) throw new Error('Connection not ready');
      return actor.deleteFile(fileId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['filesInFolder'] });
      queryClient.invalidateQueries({ queryKey: ['userFiles'] });
    },
  });
}

export function useMoveFile() {
  const { actor } = useDriveActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ fileId, newParentId }: { fileId: FileId; newParentId: FolderId | null }) => {
      if (!actor) throw new Error('Connection not ready');
      return actor.moveFile(fileId, newParentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['filesInFolder'] });
      queryClient.invalidateQueries({ queryKey: ['userFiles'] });
    },
  });
}

export function useGetFile(fileId: FileId | null) {
  const { actor, isReady } = useDriveActor();

  return useQuery<File | null>({
    queryKey: ['file', fileId],
    queryFn: async () => {
      if (!actor || !fileId) return null;
      return actor.getFile(fileId);
    },
    enabled: isReady && !!fileId,
  });
}
