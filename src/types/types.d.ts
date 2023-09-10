// Copyright (c) 2023 beryll1um
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php

/**
 * Obtain union type of all known, public property names of a given object type.
 */
type KeyOf<T> = T extends infer O ? keyof O : never;

/**
 * Construct a type with the properties of T except for those in type K.
 */
type OmitUnion<T, K> = Pick<T, Exclude<KeyOf<T>, K>>;
