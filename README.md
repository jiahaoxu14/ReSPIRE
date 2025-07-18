# ReSPIRE

## Run ReSPIRE system

### Preparation
1. Please install `npm` first: https://docs.npmjs.com/downloading-and-installing-node-js-and-npm
2. run `npm install --force` 

### Setting
- Add your Open AI API Key:
Click the `GENERATE` button and the system will ask you to enter your OpenAI API key.

### Running
Enter into `src` folder, run the command `npm start`

### User interface
Open the url: http://localhost:3000

### How to use SPIRE
1. `Main Toolbar`(top)
    - We provide three tasks in this version, and you can access them through `File` button (the first one in the toolbar).Select one task from them.
    - You can save the space by clicking the `Save Draft` button. The saved space can be uploaded by `File` -> `Upload Snapshot`.
    - When you finish your Space to Think, you can click `Generate Report` to let ChatGPT generate report for you.
    - Click `show report` button in the rightmost, you can see the generated report. It will be blank before the report generation.

2. Uploading Your Own Documents
    - You can upload your own documents through `File` -> `Upload documents`
    - Documents should be in a JSON file with the following format:
    ```json
    [
        {
            "label": "Document_1",
            "content": "Content of the first document..."
        },
        {
            "label": "Document_2",
            "content": "Content of the second document..."
        }
    ]
    ```
    - Requirements:
        - File must be valid JSON
        - Must be an array of document objects
        - Each document must have `label` and `content` properties
        - Labels should be unique identifiers for each document
        - Content can include any text, including newlines and special characters
    - An example file is provided at `src/modules/Space2Think/dataset/example_documents.json`

3. Instruction for using the space
    - `Edit menu` (top left in the space): support Undo and Redo. 
    - `UI bar` (top middle in the space): tools for the space. From left to right:
        - Arrow cursor: select documents
        - Hand cursor: move the camera
        - Create Connection
        - Create frame for clustering
        - Create stickers
        - Eraser
    - `Highlight menu`: double-click a document to activate text selection mode, where your cursor will change to a text selection cursor. Select one or more words, then right-click to open the highlight menu.
    - `Bird view` (bottom left in the space)

4. After you build your Space to Think (only the documents within frame will be generated by LLM), you can generate your report through clicking `GENERATE` button!

## Citation
If you use ReSPIRE in your research, please cite our paper:

```bibtex
@article{tangrespire,
  title={ReSPIRE: Transparent and Steerable Human-AI Sensemaking through Shared Workspace},
  author={Tang, Xuxin and Krokos, Eric and Whitley, Kirsten and North, Chris},
  journal={Authorea Preprints},
  publisher={Authorea}
}
```

