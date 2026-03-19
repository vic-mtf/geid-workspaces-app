import { Typography as MuiTypography, styled } from "@mui/material";

const StyledTypography = styled(MuiTypography)(() => ({}));

StyledTypography.defaultProps = {
  variant: "body2",
};

const Typography = StyledTypography as typeof MuiTypography;

export default Typography;
