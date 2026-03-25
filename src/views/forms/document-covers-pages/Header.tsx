import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { AppBar, Button, Toolbar, Tooltip, Typography } from "@mui/material";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import getFile from "@/utils/getFile";
import IconButton from "@/components/IconButton";
import ClassOutlinedIcon from '@mui/icons-material/ClassOutlined';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import CoverForm from "@/views/forms/document-covers-pages/CoverPageForm";

interface HeaderProps {
    refresh?: () => void;
    onClose: () => void;
}

export default function Header ({refresh, onClose}: HeaderProps) {
    const { t } = useTranslation();
    const [file, setFile] = useState<File | null | undefined>();
    return (
        <React.Fragment>
            <CoverForm
                file={file}
                setFile={setFile}
                refresh={refresh}
            />
            <AppBar sx={{ position: 'relative' }}>
                <Toolbar
                    variant="dense"
                >
                    <Tooltip arrow title={t("common.close")} enterDelay={700}>
                        <IconButton
                            size="small"
                            value=""
                            onClick={onClose}
                        >
                            <CloseRoundedIcon fontSize="small"/>
                        </IconButton>
                    </Tooltip>
                    <Typography
                        ml={1}
                        fontSize={15}
                        flexGrow={1}
                        variant="h6"
                    >
                        {t("coverPages.title")}
                    </Typography>
                    <Button
                        startIcon={<ClassOutlinedIcon/>}
                        endIcon={<AddOutlinedIcon/>}
                        color="inherit"
                        children={t("coverPages.addCover")}
                        size="small"
                        onClick={async () => {
                            const [_file] = await getFile({accept: 'image/*'});
                            if(_file) setFile(_file);
                        }}
                    />
                </Toolbar>
            </AppBar>
        </React.Fragment>
    )
}
