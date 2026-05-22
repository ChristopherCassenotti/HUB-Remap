
/* REMAP MODAL ACTIONS — expõe funções do modal para os onclicks inline */
(function(){
  const names = [
    'openTaskModal','closeTaskModal','closeTaskModalIfOutside','navTask','toggleTaskDoneModal',
    'saveTaskFromModal','deleteCurrentTask','editTmDesc','finishEditTmDesc','renderTmDescPreview',
    'addSubtask','toggleSubtask','updateSubtitle','deleteSubtask',
    'handleAttachment','deleteAttachment','addComment',
    'openAssigneePicker','setAssignee','openSectionPicker','moveTaskToCol',
    'openLabelPicker','toggleLabel','addCustomLabel','closeKPicker',
    'cyclePriority','cycleRecurrence','openTaskPointModal','closeTaskPointModal','saveTaskPoint','deleteTaskPoint','openMetaModal','closeMetaModal','saveMeta'
  ];
  names.forEach(name => {
    try {
      const fn = (0, eval)(name);
      if (typeof fn === 'function') window[name] = fn;
    } catch(e) {}
  });
})();
