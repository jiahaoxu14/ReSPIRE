import { current } from '../../LexicalEditor/time';
const jsDiff = require('diff');
// const userPrompt = ""

export function showModifications (oriReport1, oriReport2) {
    
    let reports = {}
    const tmp1 = JSON.parse(oriReport1);
    let report1 = {}, report2 ={};
    for (var item in tmp1){
        if (item == "Introduction" || item == "Conclusion"){
            let plainText = tmp1[item].replace(/\s*\[[^\]]+\]/g, '');
            report1[item] = plainText;
        }
        else {
            for (var i in tmp1[item]){
                let plainText = tmp1[item][i]["text"].replace(/\s*\[[^\]]+\]/g, '');
                report1[tmp1[item][i]["id"]] = plainText;
            }
        }
    }

    const tmp2 = JSON.parse(oriReport2);
    for (var item in tmp2){
        if (item == "Introduction" || item == "Conclusion"){
            let plainText = tmp2[item].replace(/\s*\[[^\]]+\]/g, '');
            report2[item] = plainText;
        }
        else {
            for (var i in tmp2[item]){
                let plainText = tmp2[item][i]["text"].replace(/\s*\[[^\]]+\]/g, '');
                report2[tmp2[item][i]["id"]] = plainText;
            }
        }
    }
    // console.log("report1", report1);
    // console.log("report2", report2);

    let index = 0;
    let addedFrame = [];
    for (var item in report2){
        console.log(`[${current()}]`+ "[showModifications] modification item", item);
        if (!report1.hasOwnProperty(item)){
            addedFrame.push(index); //need to be sent to plugin
        }else{
            reports[item] = {}
            reports[item]["v1"] = report1[item];
            reports[item]["v2"] = report2[item];
        }
        index += 1;
    }

    console.log(`[${current()}]`+ "[showModifications] reports", reports);   
    
    let diffDict = [];

    for (var i in reports){
        const diff = jsDiff.diffWords(reports[i]["v1"], reports[i]["v2"])
        // console.log("diff", diff);
        let diffReport = [];
        let idx = 0;
        
        let addedResult = [];
        for (var item in diff){
            if (diff[item].added){
                // diffReport.push(idx);
                diffReport.push([idx, idx + diff[item].value.length]);
                addedResult.push(idx, idx + diff[item].value.length, diff[item].value);
                idx += diff[item].value.length;
                
            }else if (diff[item].removed){
            }
            else{
                idx += diff[item].value.length;
            }
        }
        // console.log("diffReport", diffReport);
         

        let diffResult = [];
        let diffText = [];

        let currentRange = diffReport[0];

        for (let j = 1; j < diffReport.length; j++) {
            const [currentStart, currentEnd] = currentRange;
            const [nextStart, nextEnd] = diffReport[j];

            // Check if the next range overlaps or is consecutive with the current range
            if (nextStart <= currentEnd + 1) {
                // Combine the ranges
                currentRange = [currentStart, Math.max(currentEnd, nextEnd)];
            } else {
                // Add the current range to the result and start a new range
                diffResult.push([currentRange[0], currentRange[1]]);
                diffText.push(reports[i]["v2"].slice(currentRange[0], currentRange[1]));
                currentRange = diffReport[j];
            }
        }
        diffResult.push(currentRange);
        diffText.push(reports[i]["v2"].slice(currentRange[0], currentRange[1]));
        
        console.log(`[${current()}]`+ "diffReport", diffReport);
        console.log(`[${current()}]`+ "diffResult", diffResult);
        // console.log("addedResult", addedResult);
    
        //write a function to combine the same indexes
        diffDict[i] = {};
        diffDict[i]["index"] = diffResult;
        diffDict[i]["text"] = diffText;
    }
    console.log(`[${current()}]`+ "[ReplortGenerationBlank] diffDict", diffDict);
    return diffDict;

    
}
