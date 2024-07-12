import { csv } from 'd3';
import csvData from './deep_tmhmm_conflict_proteins.csv';

async function getData() {
  const data = await csv(csvData);
  return data;
}

const arrayStrConversion = str => {
  let newStr = str.replace(/'/g, '"');
  const array = JSON.parse(newStr);
  return array;
};

const getProteins = async () => {
  const proteinsData = [];
  const proteins = await getData();
  proteins.forEach(el => {
    const protein = {};
    protein.value = el['Entry'];
    protein.label = el['Entry name'];
    protein.description = el['Protein names'];
    protein.rawDSBdata = el['Disulfide bond']
    protein.disulfideBonds = arrayStrConversion(el['Disulfide bond'])
    protein.rawGLYdata = el.Glycosylation
    protein.glycoslation = arrayStrConversion(el.Glycosylation);
    // protein.length = parseInt(el['Length'], 10); // for topology
    // protein.topology = el['topology'];
    protein.length = parseInt(el['New_Length'], 10); // for orientation
    protein.oldLength = parseInt(el['Length'], 10);
    protein.topology = el['Orientation'];
    protein.oldTopology = el['topology'];
    
    const domain = parseSequence(protein.topology, protein.length)
    protein.outsideDomain = domain.o
    protein.insideDomain = domain.i
    protein.rawSEQdata = el['Sequon list']

    let sequons = arrayStrConversion(el['Sequon list'])
    protein.totalSequons = sequons
    protein.sequons = findFreeSequons(sequons, protein.glycoslation)
    protein.rawCYSdata = el['Cysteine positions']
    
    let cysteines = arrayStrConversion(el['Cysteine positions'])
    protein.totalCysteines = cysteines
    cysteines = fixPosOffset(cysteines)
    protein.cysteines = findFreeCys(cysteines, protein.disulfideBonds)
    
    proteinsData.push(protein);
  });
  
  findInterDSB(proteinsData)
  findIntraDSB(proteinsData)

  console.log(proteinsData[0])
  return proteinsData;
};

/*
Most of the following functions are related to conflict generation and not essential
to visualization (except parseSequence)
*/
function findIntraDSB(proteins){
  proteins.forEach(protein => {
    let start_position = protein.outsideDomain.map(obj => obj.start_pos)
    let end_position = protein.outsideDomain.map(obj => obj.end_pos)
    
    let bonds = protein.disulfideBonds.map(pair => {
      const bondPos = [];
      const atoms = pair.split(' ');
      atoms.forEach(el => {
        const atom = parseInt(el, 10);
        bondPos.push(atom);
      });
      return bondPos;
    });

    let intraDSB = []
    let inODomain = false
    for(let i = 0; i < bonds.length; i++){
      inODomain = false
      for(let j = 0; j < start_position.length; j++){
        if(bonds[i][0] >= start_position[j] && bonds[i][0] <= end_position[j]){//dsb leftPos
          if(bonds[i][1] >= start_position[j] && bonds[i][1] <= end_position[j]){//dsb rightPos
            inODomain = true 
          }
        }
      }
      if(inODomain){
        let str = `${bonds[i]}`
        intraDSB.push(str)
      }
    }

    if(intraDSB.length != 0){
      protein.intraDSB = JSON.stringify(intraDSB)
      protein.intraDSBLength = intraDSB.length
    }
  })
}

function findInterDSB(proteins){
  proteins.forEach(protein => {
    let start_position = protein.outsideDomain.map(obj => obj.start_pos)
    let end_position = protein.outsideDomain.map(obj => obj.end_pos)
    
    let bonds = protein.disulfideBonds.map(pair => {
      const bondPos = [];
      const atoms = pair.split(' ');
      atoms.forEach(el => {
        const atom = parseInt(el, 10);
        bondPos.push(atom);
      });
      return bondPos;
    });

    let interDSB = []
    for(let i = 0; i < bonds.length; i++){
      let isLeftIn = false
      let isRightIn = false
      let leftPos = 0
      for(let j = 0; j < start_position.length; j++){
        if(bonds[i][0] >= start_position[j] && bonds[i][0] <= end_position[j]){//dsb leftPos
          isLeftIn = true
          leftPos = j 
        }
      }
      for(let j = 0; j < start_position.length; j++){
        if(j != leftPos && bonds[i][1] >= start_position[j] && bonds[i][1] <= end_position[j]){//dsb rightPos
          isRightIn = true 
        }
      }
      if(isLeftIn && isRightIn){
        let str = `${bonds[i]}`
        interDSB.push(str)
      }
    }

    if(interDSB.length != 0){
      protein.interDSB = JSON.stringify(interDSB)
      protein.interDSBLength = interDSB.length
    }
  })
}

//special function for cysteines to fix the position (off by 1) issue
function fixPosOffset(cysteines){
  let cys = []
  for(let i = 0; i < cysteines.length; i++){
    let c = parseInt(cysteines[i]) + 1
    cys.push(c.toString())
  }
  return cys
}

/* Find free sequons in proteins
* Define free sequons as sequons that do not have a corresponding
  glycosylation bond
*/
function findFreeSequons(sequons, glycans){
  let freeSequons = []
  for(let i = 0; i < sequons.length; i++){
    let isSame = false
    for(let j = 0; j < glycans.length; j++){
      if(sequons[i] == glycans[j]){
        isSame = true
      }
    }
    if(!isSame){
      freeSequons.push(sequons[i])
    }
  }
  return freeSequons
}

/* Find free cysteines in proteins
* Define free cysteines as cysteine positions that do not have a corresponding
  disulfide bond
*/
function findFreeCys(cysteines, sulfides){
  let freeCysteines = []
  for(let i = 0; i < cysteines.length; i++){
    let isSame = false
    for(let j = 0; j < sulfides.length; j++){
      let sulfide = sulfides[j].split(" ")  
      if(cysteines[i] == sulfide[0] || cysteines[i] == sulfide[1]){
        isSame = true
      }
    }
    if(!isSame){
      freeCysteines.push(cysteines[i])
    }
  }
  return freeCysteines
}

/* 
Parse the topological sequence into an array thats easily accessible 
*/
function parseSequence(sequence, length){
  let newString = ''
  let start, end
  let outside = []
  let inside = []
  let pos = ''
  /* Object template
    {
        start_pos: start,
        end_pos: end
    }
  */

  for(let i = 0; i < sequence.length; i++){
    if(sequence[i] !== '-'){  
      if(sequence[i] === 'o'){
        pos = sequence[i]
        start = newString
        newString = "";
        if(start == null || start == ''){
          start = 0
        }
        if(i == sequence.length-1){//last character scenario  
          end = length
          let entry = {
            start_pos: start,
            end_pos: end
          }
          outside.push(entry)
        }
      }else if(sequence[i] === 'i'){
        pos = sequence[i]
        start = newString
        newString = "";
        if(start == null || start == ''){
          start = 0
        }
        if(i == sequence.length-1){//last character scenario
          end = length
          let entry = {
            start_pos: start,
            end_pos: end
          }
          inside.push(entry)
        }
      }else{
        newString += sequence[i]
      }
    }else{
      end = newString
      let entry = {
      start_pos: start,
      end_pos: end
      }
      if(pos === 'o'){
        outside.push(entry)
      }else{
        inside.push(entry)
      }
          
      newString = "";
    }
  }

  const domain = {o: outside, i: inside}
  return domain
}

export default { getProteins };