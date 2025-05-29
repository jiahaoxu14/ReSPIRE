import { useEditor, Editor, useValue } from 'tldraw'
import { useEffect } from 'react'
import { current } from '../../LexicalEditor/time';

function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}

export async function reportToSpace (editor, oriReport) {
    const snapshot = editor.store.getSnapshot().store;
    console.log(`[${current()}]`+ "[reportToSpace] blankReport: ", oriReport);
    console.log(`[${current()}]`+ "[reportToSpace] snapshot", snapshot);
    let minX = 999, minY = 999, maxX = 0, maxY = 0;
    for (var item in snapshot){
        if (!snapshot[item].id.includes("shape:")) continue;
        const x = snapshot[item].x;
        const y = snapshot[item].y;
        if (x < minX) minX = x;
        if (x + snapshot[item].props.w > maxX) maxX = x + snapshot[item].props.w;
        if (y < minY) minY = y;
        if (y + snapshot[item].props.h> maxY) maxY = y + snapshot[item].props.h;
    }

    console.log(`[${current()}]`+ "[reportToSpace] maxX", maxX);

    let startX = maxX + 200;
    let startY = minY;

    const report = JSON.parse(oriReport);
    // let cluster = {};
    let newReport = {};
    newReport["Introduction"] = report["Introduction"];
    newReport["Middle_paragraph"] = [];
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var item in report["Middle_paragraph"]){
        let middle = {};
        const files = report["Middle_paragraph"][item]["files"]
        // const id = report["Middle_paragraph"][item]["id"]
        const id = "shape:" +  makeid(9);
        // console.log("report['Middle_paragraph'][item]", report["Middle_paragraph"][item]);
        middle["id"] = id;
        middle["name"] = report["Middle_paragraph"][item]["name"];
        middle["summarization"] = report["Middle_paragraph"][item]["summarization"];
        middle["text"] = report["Middle_paragraph"][item]["text"];
        middle["name entities"] = report["Middle_paragraph"][item]["name entities"];
        middle["keywords"] = report["Middle_paragraph"][item]["keywords"];
        newReport["Middle_paragraph"].push(middle);

        // console.log("files", files);
        // cluster[id] = files;
        let length = files.length;
        let yNum = Math.ceil(length / 3);
        console.log(`[${current()}]`+ "[reportToSpace] yNum", yNum, "length", length);
        // create clusters
        // editor.createShapes([{ id: id, type: 'frame', x: startX, y: startY, props: {w: 510 * 3, h: 370 * yNum, name: middle["name"]}}])
        // for (var i = 0; i < files.length; i++){
        //     const file = files[i];
        //     const x = 510 * (i % 3);
        //     const y = 370 * Math.floor(i / 3);
        //     for (var item in snapshot){
        //         if (!snapshot[item].id.includes("shape:")) continue;
        //         if (snapshot[item].props.label == file){
        //             editor.updateShapes([{id: snapshot[item].id, parentId: id, x: x, y: y}])
        //         }
        //     }
        // }

        // startY += 370* yNum + 100;
        // editor.setCamera({ x: startX*1, y: minY*1, z: 0.5 }, { duration: 200, easing: (t) => t * t });
    }


    newReport["Conclusion"] = report["Conclusion"];
    const outputReport = JSON.stringify(newReport);

    console.log(`[${current()}]`+ "[reportToSpace] newReport", outputReport);

    // editor.setCamera({ x: startX*1, y: minY*1, z: 0.5 }, { duration: 200, easing: (t) => t * t });
    return outputReport;
}
