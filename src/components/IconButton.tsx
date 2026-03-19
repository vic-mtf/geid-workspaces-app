import { styled, ToggleButton } from "@mui/material";

const StyledIconButton = styled(ToggleButton)(() => ({
  border: "none",
  "&:disabled": {
    border: "none",
  },
}));

StyledIconButton.defaultProps = {
  size: "small",
  value: "",
};

const IconButton = StyledIconButton as typeof ToggleButton;

export default IconButton;
