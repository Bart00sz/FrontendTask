import React, { useState, useEffect } from 'react';
import './styles.css';
type Color = {
  hex: string;
  removable: boolean;
};

const defaultColors: Color[] = [
  { hex: '#FFFFFF', removable: false }, 
  { hex: '#FFFF00', removable: false }, 
  { hex: '#FF0000', removable: false } 
];

const getColorListFromLocalStorage = (): Color[] => {
  const storedColors = localStorage.getItem('colors');
  if (storedColors) {
    try {
      const parsedColors = JSON.parse(storedColors);
      if (Array.isArray(parsedColors)) {
        return parsedColors.map((color: string) => ({ hex: color.toUpperCase(), removable: true }));
      }
    } catch (error) {
      console.error('Failed to parse stored colors from LocalStorage:', error);
    }
  }
  return [];
};

const setColorListInLocalStorage = (colors: Color[]) => {
  const stringifiedColors = JSON.stringify(colors.map((color) => color.hex));
  localStorage.setItem('colors', stringifiedColors);
};

const hexToRgb = (hex: string): string => {
  const strippedHex = hex.replace('#', '');
  const r = parseInt(strippedHex.substring(0, 2), 16);
  const g = parseInt(strippedHex.substring(2, 4), 16);
  const b = parseInt(strippedHex.substring(4, 6), 16);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const saturation = (max === 0) ? 0 : (max - min) / max;
  const saturationPercentage = Math.round(saturation * 100);
  return `${r}, ${g}, ${b} (Saturation: ${saturationPercentage}%)`;
};

const ColorList: React.FC = () => {
  const [colors, setColors] = useState<Color[]>([...defaultColors, ...getColorListFromLocalStorage()]);
  const [newColor, setNewColor] = useState<string>('');
  const [filterCondition, setFilterCondition] = useState<string>('');
 
  useEffect(() => {
    console.log(colors);
    setColorListInLocalStorage(colors.filter((color) => color.removable));
  }, [colors]);

  const addColor = () => {
    if (newColor) {
      const newColorUpper = newColor.toUpperCase();
      const regex = /^[0-9A-F]+$/;
      if (
        newColorUpper.length <= 7 &&
        newColorUpper[0] === "#" &&
        regex.test(newColorUpper.substring(1)) &&
        !colors.some((color) => color.hex === newColorUpper)
      ) {
        setColors((prevColors) => [
          ...prevColors,
          { hex: newColorUpper, removable: true },
        ]);
        setNewColor("");
      } else {
        alert("Invalid color format!");
      }
    }
  };

  const removeColor = (hexValue: string) => {
    setColors(prevColors => {
      const updatedColors = prevColors.filter(color => color.hex !== hexValue);
      return updatedColors;
    });
  };

  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterCondition(event.target.value);
  };


  
  const filteredColors = colors.filter((color) => {
    switch (filterCondition) {
      case 'red':
        return parseInt(color.hex.substr(1, 2), 16) > 127;
      case 'green':
        return parseInt(color.hex.substr(3, 2), 16) > 127;
      case 'blue':
        return parseInt(color.hex.substr(5, 2), 16) > 127;
      case 'saturation':
        const strippedHex = color.hex.replace('#', '');
        const r = parseInt(strippedHex.substring(0, 2), 16) / 255;
        const g = parseInt(strippedHex.substring(2, 4), 16) / 255;
        const b = parseInt(strippedHex.substring(4, 6), 16) / 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const saturation = (max === 0) ? 0 : (max - min) / max;
        
        return saturation > 0.5;
      default:
        return true;
    }
  }).sort((colorA, colorB) => {
    const hexA = colorA.hex.substr(1);
    const hexB = colorB.hex.substr(1);
    const rA = parseInt(hexA.substr(0, 2), 16);
    const rB = parseInt(hexB.substr(0, 2), 16);
    const gA = parseInt(hexA.substr(2, 2), 16);
    const gB = parseInt(hexB.substr(2, 2), 16);
    const bA = parseInt(hexA.substr(4, 2), 16);
    const bB = parseInt(hexB.substr(4, 2), 16);
    if (rA !== rB) {
      return rB - rA;
    }
    if (gA !== gB) {
      return gB - gA;
    }
    return bB - bA;
  });

 
    
    return (
      
      <div className="wrapper">
          <h1>Frontend Test Task</h1>
          <header>   <select id="filter-select" value={filterCondition} onChange={handleFilterChange}>
        <option value=""> No filter choosen</option>
        <option value="red">Red over 50%</option>
        <option value="green">Green over 50%</option>
        <option value="blue">Blue over 50%</option>
        <option value="saturation">Saturation over 50%</option>
      </select> </header>
    

<nav>
{filteredColors.map((color) => (
  <div key={color.hex} className="main">
    <div style={{ backgroundColor: color.hex, width: '24px', height: '24px' }} />
  
    <div>{hexToRgb(color.hex)}</div>
    {color.removable && (
      <button onClick={() => removeColor(color.hex)}>X</button>
    )}
  </div>
))}
    
      </nav>
        <div>
          <input
            type="text"
            value={newColor}
            onChange={(event) => setNewColor(event.target.value)}
            placeholder="Enter a new color in HEX RGB format"
          />
          <button onClick={addColor}>
            Add
          </button>
        </div>
      </div>
    );
  };


export default ColorList;