function addTrigger() {
    // Apps Scriptのトリガー設定
    const spreadSheet = SpreadsheetApp.getActiveSpreadsheet();
    ScriptApp.newTrigger("nurinuri")
	.forSpreadsheet(spreadSheet)
	.onChange()
	.create();
}
