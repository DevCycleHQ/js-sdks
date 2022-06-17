// Type to retrieve the element type from an array
// eg. ArrayElement<string[]> -> string
export type ArrayElement<ArrayType extends readonly unknown[]> =
    ArrayType extends readonly (infer ElementType)[] ? ElementType : never;
