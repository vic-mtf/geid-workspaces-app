import { Avatar as MuiAvatar, styled } from "@mui/material";

const Avatar = styled(MuiAvatar)(() => ({
  borderRadius: 4,
}));

Avatar.defaultProps = {
  variant: "rounded",
};

export default Avatar;
