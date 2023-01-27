import useTheme from "./useTheme";
import { useSelector } from "react-redux";
import { useLayoutEffect, useMemo } from "react";
import { ThemeProvider } from "@mui/material";

export default function ConfigAppWrapper ({ children }) {
    const { lang } = useSelector(store => store.app);
    const theme = useTheme();
    const bgcolor = useMemo(() => theme.palette.background.default, [theme]);
    
    useLayoutEffect(() => {
      document.head.parentElement.lang = lang;
      document.body.parentElement.style.backgroundColor = bgcolor;
      document.body.style.backgroundColor = bgcolor;
    }, [lang, bgcolor]);
  
    return ( 
      <ThemeProvider theme={theme}>
            {children}
      </ThemeProvider>
      );
  }