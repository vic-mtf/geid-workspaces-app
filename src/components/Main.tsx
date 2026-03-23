import { styled } from "@mui/material/styles";

/**
 * Composant Main — zone de contenu principale.
 * flexGrow gère l'espace : la sidebar persistante prend sa largeur,
 * Main prend le reste via flex:1.
 */
const Main = styled("main")({
  flexGrow: 1,
  flexShrink: 1,
  flex: 1,
  minWidth: 0,
  minHeight: 0,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
});

export default Main;
