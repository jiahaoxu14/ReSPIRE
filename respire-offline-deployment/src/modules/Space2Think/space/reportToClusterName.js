export function reportToClusterName (editor, oriReport) {
    const snapshot = editor.store.getSnapshot().store;
    const report = JSON.parse(oriReport);
    let newReport = {};
    newReport["Middle_paragraph"] = [];
    for (var item in report["Middle_paragraph"]){
        let middle = {};
        const id = report["Middle_paragraph"][item]["id"]
        const props = snapshot[id].props;
        console.log("props", props.name);
        if (props.name===""){
            middle["id"] = id;
            middle["name"] = report["Middle_paragraph"][item]["name"];
            newReport["Middle_paragraph"].push(middle);
            editor.updateShape(
                {
                    id: id, 
                    type: "frame",
                    props: {
                        ...props, 
                        name: middle["name"]
                    }
                }
            )
        }
    }

}
