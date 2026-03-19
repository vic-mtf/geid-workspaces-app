import { styled, Typography as MuiTypography } from "@mui/material";

const StyledLink = styled(MuiTypography)(({ theme }) => ({
  textDecoration: "none",
  color: theme.palette.primary.main,
}));

(StyledLink as any).defaultProps = {
  variant: "body2",
  component: "a",
  fontWeight: "bold",
};

const Link = StyledLink as typeof MuiTypography;

export default Link;
