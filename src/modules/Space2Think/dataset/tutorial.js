
export const data = [
    {label: "doc_1", content: "A man was discovered dead in his home one quiet Sunday morning. The police rushed to the scene and began their investigation. They questioned the wife, the cook, and the maid in the house. One of them is lying. Can you figure out who committed the murder?"},
    {label: "doc_2", content: "The wife, wrapped in a robe, said she had been sound asleep. "},
    {label: "doc_3", content: "The cook, still wearing his apron, claimed he was busy preparing breakfast."},
    {label: "doc_5", content: "The maid, holding a letter, stated she was fetching the mail."},
    {label: "doc_6", content: "Emma called the police in a panic, claiming her precious antique necklace had been stolen. When they arrived at her home, they found a broken window, a room in disarray, and dirty footprints on the carpet."},
    {label: "doc_7", content: "There's no mail service on Sundays."},
]

// const type = 'xx_html';
// const x = 100;
// const y = 100;
const highlight = [];
const testShapes = {}

function addAttributesToJson(jsonData) {
    // console.log('jsonData', jsonData)
    const result = []
    // Loop through each item in the jsonData array
    jsonData.forEach(item => {
        // Add each new attribute and its value to the item
        result.push({
            type: 'xx_html',
            x: 120,
            y: 120,
            props: {
                w: 500,
                h: 400,
                label: item['label'],
                content: item['content'],
            }
        })
    });

    return result;
}

const tutorial = addAttributesToJson(data);

export default tutorial;