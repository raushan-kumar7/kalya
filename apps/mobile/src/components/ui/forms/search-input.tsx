import React, { useState, useEffect, useMemo } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Search } from 'lucide-react-native';
import { debounce } from '@kalya/utils';
import { Input, InputProps } from './input';

export interface SearchInputProps extends Omit<InputProps, 'leftIcon'> {
  /**
   * Debounce delay in milliseconds before triggering onSearch.
   * @default 300
   */
  debounceMs?: number;

  /**
   * Debounced callback invoked when the user stops typing.
   */
  onSearch?: (query: string) => void;

  /**
   * Indicates an active network search query is in flight.
   * @default false
   */
  isSearching?: boolean;
}

/**
 * SearchInput provides a debounced search input field with integrated
 * loading indicators, tactile clearing, and search iconography.
 *
 * Uses debounce from @kalya/utils.
 *
 * @param props - SearchInputProps
 * @returns React.JSX.Element
 */
export const SearchInput: React.FC<SearchInputProps> = ({
  debounceMs = 300,
  onSearch,
  isSearching = false,
  value: controlledValue,
  onChangeText,
  placeholder = 'Search transactions, merchants, tags...',
  clearable = true,
  rightIcon,
  onClear,
  ...rest
}) => {
  const [internalValue, setInternalValue] = useState(controlledValue || '');

  // Sync external controlled value
  useEffect(() => {
    if (controlledValue !== undefined) {
      setInternalValue(controlledValue);
    }
  }, [controlledValue]);

  // Use timing utility from @kalya/utils
  const debouncedSearch = useMemo(() => {
    if (!onSearch) return null;
    return debounce((text: string) => {
      onSearch(text);
    }, debounceMs);
  }, [onSearch, debounceMs]);

  useEffect(() => {
    return () => {
      debouncedSearch?.cancel();
    };
  }, [debouncedSearch]);

  const handleChangeText = (text: string) => {
    setInternalValue(text);
    onChangeText?.(text);
    debouncedSearch?.(text);
  };

  const handleClear = () => {
    debouncedSearch?.cancel();
    setInternalValue('');
    onChangeText?.('');
    onSearch?.('');
    onClear?.();
  };

  return (
    <Input
      value={internalValue}
      onChangeText={handleChangeText}
      placeholder={placeholder}
      clearable={clearable}
      onClear={handleClear}
      leftIcon={<Search size={16} color="#5d8a72" />}
      rightIcon={
        isSearching ? (
          <View className="items-center justify-center mr-1">
            <ActivityIndicator size="small" color="#0d3e26" />
          </View>
        ) : (
          rightIcon
        )
      }
      {...rest}
    />
  );
};
