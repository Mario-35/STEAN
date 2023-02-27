// ===============================================================================
// |                                     GUI                                     |
// ===============================================================================


/**
 * Show message popup
 * @param {*} titleMess 
 * @param {*} bodyMess 
 */
function notifyError(titleMess, err) {
    new Error({
      title: titleMess,
      content: typeof err === "object"?  err.message: err
    });        
  };
    
    function notifyAlert(titleMess, message) {
      new Alert({
        title: titleMess,
        content: message
      }); 
    };
    function notifyPrompt(titleMess, message,submitText,placeholderText) {
      new Prompt({
        title: titleMess,
        content: message,
        submitText,
        placeholderText
      }); 
    };

    function notifyJson(titleMess, contentJson) {
      new ViewJson({
        title: titleMess,
        content: contentJson
      }); 
    };
      
function notifyConfirm(titleMess, message) {
      new Confirm({
        title: titleMess,
        content: message
    });        
};