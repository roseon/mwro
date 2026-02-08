export type OptionalParams<T> = T extends undefined ? [] : [T];

export type NonNullableAll<T> = {
	[P in keyof T]: NonNullable<T[P]>;
};

export type NonNullableProps<T, P extends keyof T> = T & NonNullableAll<Pick<T, P>>;

export type Override<T1, T2> = Omit<T1, keyof T2> & T2;
