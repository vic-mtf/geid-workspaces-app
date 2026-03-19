interface NormaliseParams {
  unit?: number;
  showMainUnit?: boolean;
  pad?: number;
  size?: number;
}

let initParams: NormaliseParams = {
  unit: 1000,
  showMainUnit: true,
  pad: 2,
};

export default function normaliseOctetSize(
  sizeData: number | NormaliseParams,
  params: NormaliseParams = { ...initParams }
): string {
  initParams = { ...initParams, ...params };
  const { size, unit = 1000, showMainUnit = true, pad = 2 } =
    typeof sizeData === "object"
      ? { ...initParams, ...sizeData }
      : { ...initParams, ...params, size: sizeData };

  const selectedUnit: { mainUnit?: string; val?: string[] } = {};
  const units = ["o", "Ko", "Mo", "Go", "To", "Po", "Eo", "Zo", "Yo"];
  let i = 0;
  for (; i < units.length; i++)
    if ((size ?? 0) < Math.pow(unit, i + 1)) {
      selectedUnit.mainUnit = units[i];
      const val = (size ?? 0) / Math.pow(unit, i);
      selectedUnit.val = String(val).split(".");
      break;
    }

  if (!selectedUnit.val) return "0o";

  return (
    selectedUnit.val[0] +
    (selectedUnit.val[1]
      ? "." +
        String(
          Math.round(
            parseFloat(
              selectedUnit.val[1].slice(0, 2) +
                "." +
                selectedUnit.val[1].slice(2).padEnd(1, "0")
            )
          )
        ).padEnd(pad, "0")
      : "") +
    (showMainUnit ? selectedUnit.mainUnit : "")
  );
}
