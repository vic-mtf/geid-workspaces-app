let initParams = {
    unit: 1000,
    showMainUnit: true,
    pad: 2
  };
  export default function normaliseOctetSize(sizeData, params={...initParams}) {
    initParams = {...initParams, ...params};
    const {size, unit, showMainUnit, pad} = typeof sizeData === 'object' ? 
    {...initParams, ...sizeData} : { ...initParams, ...params, size: sizeData };
    const selectedUnit = {}, units = ['o', 'Ko', 'Mo', 'Go', 'To', 'Po', 'Eo', 'Zo', 'Yo'];
    let i = 0;
    for(; i < units.length; i++)
      if(size < Math.pow(unit, i + 1)) {
        selectedUnit.mainUnit = units[i];
        selectedUnit.val = size / Math.pow(unit, i);
        break;
      }
    selectedUnit.val = String(selectedUnit.val).split('.');
    return (
        selectedUnit.val[0] +
          (selectedUnit.val[1] ? '.' +
        String(Math.round(parseFloat(
          selectedUnit.val[1].slice(0, 2) + '.' +
          selectedUnit.val[1].slice(2).padEnd(1, '0')
        ))).padEnd(pad, '0') : '') +
      (showMainUnit ? selectedUnit.mainUnit : '')
    );
  
  }
  