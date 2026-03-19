import { Toolbar, Box as MuiBox, Divider } from "@mui/material";
import queryString from "query-string";
import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import ArchivesForm from "../forms/archives/ArchivesForm";
import MediaLibraryForm from "../forms/medialibrary/MediaLibraryForm";
import DetailFIle from "./displays/thumbnail/DetailFIle";
import RenameFile from "./displays/thumbnail/RenameFile";
import Thumbnail from "./displays/thumbnail/Thumbnail";
import SubHeader from "./sub-header/SubHeader";
import FilesForm from "../forms/files/FilesForm";
import { RootState } from "../../types";

export default function Main () {
    const data = useSelector((store: RootState) => store.data);
    const { pathname, search } = useLocation();

    const key = useMemo(() => {
        const _doc = 'documents';
        const _img = 'images';
        const _vid = 'videos';
        const _oth = 'others';
        if(!pathname || pathname.match(new RegExp(_doc))) return _doc;
        if(pathname.match(new RegExp(_img))) return _img;
        if(pathname.match(new RegExp(_vid))) return _vid;
        if(pathname.match(new RegExp(_oth))) return _oth;
        return _doc;
    }, [pathname]);

    const { sort, order, display } = queryString.parse(search);
    const _data = useMemo(() => {
        let __data = [...((data as any)[key] || [])];
        if(!sort || sort === 'name')
            __data?.sort((a: any, b: any) => {
                const nameA = a?.name.toUpperCase();
                const nameB = b?.name.toUpperCase();
                if (nameA < nameB) return -1;
                if (nameA > nameB) return 1;
                return 0;
            });
        if(sort === 'date')
            __data?.sort(
                (a: any, b: any) => (new Date(a?.createdAt)).getTime() - (new Date(b?.createdAt)).getTime()
            );
        if(!order || order === 'ascending') { /* ascending is default, no action needed */ }
        if(order === 'descending')
           __data = __data?.reverse();
        return __data;
    },[key, data, sort, order]);

    return (
        <React.Fragment>
            <MuiBox component="main" sx={{ flexGrow: 1, px: .5, width: "100%" }}>
                <Toolbar variant="dense"/>
                <SubHeader/>
                <Divider/>
                <MuiBox
                    height="calc(100% - 100px)"
                    overflow="hidden"
                >
                    { (!display || display === 'thumbnail') && <Thumbnail data={_data}/> }
                </MuiBox>
            </MuiBox>
            <RenameFile/>
            <DetailFIle/>
            <MediaLibraryForm/>
            <ArchivesForm/>
            <FilesForm/>
        </React.Fragment>
    )
}
