
import fileExtensionBase from "@/utils/fileExtensionBase";
import getFileExtension from "@/utils/getFileExtension";
import { FileExtensionInfo } from "@/types";

export default function getFileInfos (file: { name: string }): FileExtensionInfo | undefined {
        return fileExtensionBase.find(({ exts }) => (
                ~exts.indexOf(getFileExtension(file.name) ?? "")
                )
        );
}
