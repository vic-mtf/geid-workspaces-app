
import fileExtensionBase from "./fileExtensionBase";
import getFileExtension from "./getFileExtension";

export default function  getFileInfos (file) {
        return fileExtensionBase.find(({ exts }) => (
                ~exts.indexOf(getFileExtension(file.name))
                )
        );
}