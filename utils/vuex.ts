export type VuexDispatch<P> = <T extends keyof P>( type: T, value?: P[T] ) => Promise<any[]>;
export type VuexCommit<P> = <T extends keyof P>( type: T, value?: P[T] ) => void;
