const inputFile = document.createElement("input");

export default function getFile(props: Record<string, any> = {}): Promise<FileList> {
  return new Promise((resolve, reject) => {
    if (typeof props === "object" && props)
      Object.keys(props).forEach((prop) => {
        (inputFile as any)[prop] = props[prop];
      });
    inputFile.type = "file";
    inputFile.value = "";
    inputFile.onchange = (event) => {
      const { files } = event.target as HTMLInputElement;
      if (files?.length) resolve(files);
      else reject(new Error("impossible to get files"));
    };
    inputFile.click();
  });
}
