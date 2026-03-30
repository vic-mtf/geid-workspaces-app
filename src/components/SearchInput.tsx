import { alpha, InputBase, styled } from "@mui/material";
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import React from "react";

const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(3),
      width: 'auto',
    },
  }));

  const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }));

  const ClearButton = styled('div')(({ theme }) => ({
    position: 'absolute',
    right: 0,
    top: 0,
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(0, 1),
    cursor: 'pointer',
    color: 'inherit',
    opacity: 0.6,
    '&:hover': { opacity: 1 },
  }));

  const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    width: '100%',
    '& .MuiInputBase-input': {
      padding: theme.spacing(.5, 3.5, .5, 0),
      paddingLeft: `calc(1em + ${theme.spacing(4)})`,
      transition: theme.transitions.create('width'),
      width: '100%',
      [theme.breakpoints.up('md')]: {
        width: '50ch',
      },
    },
  }));

interface SearchInputProps {
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  onClear?: () => void;
  placeholder?: string;
}

const SearchInput = React.forwardRef<HTMLDivElement, SearchInputProps>(function SearchInput(
  { value, onChange, onFocus, onClear, placeholder = "Chercher\u2026" },
  ref
) {
    return (
        <Search ref={ref}>
            <SearchIconWrapper>
              <SearchRoundedIcon fontSize="small" />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder={placeholder}
              inputProps={{ 'aria-label': 'chercher' }}
              size="small"
              value={value}
              onChange={onChange}
              onFocus={onFocus}
            />
            {value && value.length > 0 && (
              <ClearButton onClick={onClear}>
                <ClearRoundedIcon sx={{ fontSize: 18 }} />
              </ClearButton>
            )}
          </Search>
    );
});

export default SearchInput;
