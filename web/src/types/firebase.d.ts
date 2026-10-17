declare module 'firebase/app' {
  export interface FirebaseApp {
    name: string;
    options: Record<string, any>;
  }
  export function initializeApp(options: Record<string, any>, name?: string): FirebaseApp;
  export function getApps(): FirebaseApp[];
  export function getApp(name?: string): FirebaseApp;
}

declare module 'firebase/auth' {
  import { FirebaseApp } from 'firebase/app';
  export interface User {
    uid: string;
    isAnonymous: boolean;
    getIdToken(): Promise<string>;
    [key: string]: any;
  }
  export interface UserCredential {
    user: User;
  }
  export interface Auth {
    app: FirebaseApp;
    currentUser: User | null;
  }
  export function getAuth(app?: FirebaseApp): Auth;
  export function signInAnonymously(auth: Auth): Promise<UserCredential>;
  export function onAuthStateChanged(
    auth: Auth,
    nextOrObserver: (user: User | null) => void,
    error?: (error: any) => void,
    completed?: () => void
  ): () => void;
}

declare module 'firebase/firestore' {
  import { FirebaseApp } from 'firebase/app';
  export interface Firestore {
    app: FirebaseApp;
  }
  export function getFirestore(app?: FirebaseApp): Firestore;
  export interface DocumentData {
    [field: string]: any;
  }
  export interface DocumentSnapshot<T = DocumentData> {
    id: string;
    exists(): boolean;
    data(): T | undefined;
  }
  export interface QuerySnapshot<T = DocumentData> {
    docs: Array<{ id: string; data(): T }>;
  }
  export interface DocumentReference<T = DocumentData> {}
  export interface CollectionReference<T = DocumentData> {}
  export function doc(db: Firestore, path: string, ...pathSegments: string[]): DocumentReference;
  export function collection(db: Firestore, path: string, ...pathSegments: string[]): CollectionReference;
  export function onSnapshot(ref: DocumentReference, cb: (snap: DocumentSnapshot) => void): () => void;
  export function onSnapshot(ref: CollectionReference, cb: (snap: QuerySnapshot) => void): () => void;
}

declare module 'firebase/storage' {
  import { FirebaseApp } from 'firebase/app';
  export interface FirebaseStorage {
    app: FirebaseApp;
  }
  export function getStorage(app?: FirebaseApp): FirebaseStorage;
}

