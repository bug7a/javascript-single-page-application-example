/*

TO-DO LIST WEB AND MOBILE APP:

- An application that keeps a to-do list.
- When the application is closed, the information is stored in local storage.

To make an android or iOS application with Apache Cordova.
https://cordova.apache.org/

How to make an Android application? (Language: Turkish)
https://www.youtube.com/watch?v=B6x7yKhKZbY

How to make an iOS application? (Language: Turkish)
https://www.youtube.com/watch?v=WZZwiI_5WQA

FOR YOUR CORDOVA PROJECT: 
- Add these settings to your cordova project config.xml file:
    <preference name="DisallowOverscroll" value="true" />
    <preference name="StatusBarOverlaysWebView" value="false" />
    <preference name="StatusBarStyle" value="darkcontent" />
    <preference name="Orientation" value="portrait" />
- Add these plugins to your cordova project:
    cordova plugin add cordova-plugin-statusbar

*/

var USED_WIDTH = 500
var MAX_ZOOMABLE_WIDTH = 700

var taskList = []
var taskDataList = []

// BOX: Container box of home content.
var homePage

// Shortcut names for frequently used objects.
var txtNewTask
var lblSelectedCount

// First running function.
var start = function() {

    // Support all resolutions.
    page.fit(USED_WIDTH, MAX_ZOOMABLE_WIDTH)

    // Restore saved information.
    loadTaskDataList()

    // UI: HOME PAGE:
    // BOX: Container box of home content. Parameters: left, top, width, height.
    homePage = createBox(0, 0, USED_WIDTH, page.height)
    that.color = "white"
    that.center("left")
    
    // UI: ADD NEW TASK:
    // BOX: Container box for adding new task.
    homePage.boxNewTask = createBox(10, 10, 480, 80)
    that.color = "whitesmoke"
    that.border = 0
    that.round = 16
    
    // TEXTBOX: Where the new task is written.
    homePage.boxNewTask.txtNewTask = createTextBox(20, 15, 380)
    that.minimal = 1
    that.color = "transparent"
    that.inputElement.setAttribute("placeholder", "Add a task")
    that.onChange(addTask)
    // Set shortcut name.
    txtNewTask = homePage.boxNewTask.txtNewTask

    // LABEL: Add new task label button.
    homePage.boxNewTask.lblAddButton = createLabel()
    that.text = "+"
    that.textAlign = "center"
    that.color = "#23BCC1BB"
    that.textColor = "rgba(255, 255, 255, 0.95)"
    that.height = 50
    that.width = that.height
    that.fontSize = 36
    that.round = 25
    that.aline(txtNewTask, "right", 5)
    that.onClick(addTask)
    
    // UI: TASK ITEMS:
    // BOX: Scrollable container box of task items.
    homePage.boxTaskItemList = createBox(10, 100, 480, page.height - 110)
    that.color = "white"
    that.border = 0
    that.scrollY = 1
    
    // UI: DELETE TASKS:
    // BOX: Container box for delete tasks.
    homePage.boxDeleteTask = createBox(10, 10, 480, 80)
    that.color = "whitesmoke"
    that.round = 16
    that.visible = 0

    // BOX: Background box for delete image.
    homePage.boxDeleteTask.boxBackground = createBox(0, 0, 55, 55)
    that.color = "#ED6D5230"
    that.round = 30
    that.center()
    that.onClick(removeSelectedTasks)

    // IMAGE: Delete image.
    homePage.boxDeleteTask.boxBackground.imgDelete = createImage(0, 0, 35, 35)
    that.load("images/trash.svg")
    that.opacity = 0.9
    that.center()

    // LABEL: Count of selected items on delete image.
    homePage.boxDeleteTask.lblCount = createLabel()
    that.left = homePage.boxDeleteTask.boxBackground.left + 41
    that.top = homePage.boxDeleteTask.boxBackground.top - 4
    that.width = "auto"
    that.height = "auto"
    that.color = "white"
    that.text = "0"
    that.textColor = "#141414"
    that.fontSize = 16
    that.spaceY = 2
    that.spaceX = 7
    that.border = 1
    that.borderColor = "#141414"
    that.element.style.fontFamily = "opensans-bold"
    that.round = 50
    that.opacity = 0.7
    // Set shortcut name.
    lblSelectedCount = homePage.boxDeleteTask.lblCount

    // When page reopens, create old records.
    refreshTasks()

    // Run each time the page size changes.
    page.onResize(resizeHomePage)
}

var resizeHomePage = function() {

    page.fit(USED_WIDTH, MAX_ZOOMABLE_WIDTH)

    homePage.height = page.height
    homePage.boxTaskItemList.height = page.height - 110
    homePage.center("left")
}

var addTask = function() {

    var taskText = txtNewTask.text

    if (taskText != "") {
        addTaskItem(taskText)
        addTaskData(taskText)

        txtNewTask.text = ""
    }
}

// Clear all tasks and recreate based on data list.
var refreshTasks = function() {

    // Clear all tasks.
    taskList = []
    homePage.boxTaskItemList.html = ""

    for (var i = (taskDataList.length - 1); i >= 0; i--) {
        addTaskItem(taskDataList[i])
    }
}

// Add new task item object.
var addTaskItem = function(taskText) {

    var newItem = createTaskItem(taskText)
    homePage.boxTaskItemList.add(newItem)

    taskList.unshift(newItem)

    // After the automatic size calculation is complete, reposition the objects.
    newItem.lblText.onResize(repositionTasks)

    // NOTE: .onResize() has been added for each item of the tasks;
    // when a task's text changes size, all tasks are repositioned.
}

// Add new task data.
var addTaskData = function(taskText) {
    taskDataList.unshift(taskText)
    saveTaskDataList()
}

// Create new task item object.
var createTaskItem = function(taskText) {

    // BOX: Task item container box.
    var box = createBox(0, 0, 480, 100)
    that.color = "white"
    that.round = 4
    that.onClick(selectTask)
    // Let vertical position change be with motion.
    that.setMotion("top 0.3s")

    // LABEL: Task text.
    box.lblText = createLabel(50, 10, 410, "auto")
    that.color = "transparent"
    that.text = taskText

    // BOX: Selection circle.
    box.boxTick = createBox(15, 15, 20, 20)
    that.round = 10
    that.border = 1
    that.color = "whitesmoke"
    that.borderColor = "lightgray"

    makeBasicObject(box)
    return box
}

var selectTask = function(clickedTask) {

    // If item is not selected:
    if (clickedTask.boxTick.color != "tomato") {
        clickedTask.boxTick.color = "tomato"
        clickedTask.boxTick.border = 0
        clickedTask.lblText.textColor = "tomato"
        lblSelectedCount.text = num(lblSelectedCount.text) + 1

    } else {
        clickedTask.boxTick.color = "whitesmoke"
        clickedTask.boxTick.border = 1
        clickedTask.lblText.textColor = basic.TEXT_COLOR
        lblSelectedCount.text = num(lblSelectedCount.text) - 1
    }

    // Show/hide delete task box by selected count.
    if (num(lblSelectedCount.text) > 0) {
        homePage.boxDeleteTask.visible = 1

    } else {
        homePage.boxDeleteTask.visible = 0
    }
}

var removeSelectedTasks = function() {

    var newtaskItemDataList = []
    var newtaskItemList = []

    for (var i = 0; i < taskList.length; i++) {
        // If item is not selected:
        if(taskList[i].boxTick.color != "tomato") {
            newtaskItemDataList.push(taskDataList[i])
            newtaskItemList.push(taskList[i])

        } else {
            taskList[i].remove()
        }
    }

    taskDataList = newtaskItemDataList
    taskList = newtaskItemList
    saveTaskDataList()

    repositionTasks()

    // Clean and hide delete task box.
    lblSelectedCount.text = "0"
    homePage.boxDeleteTask.visible = 0
}

var saveTaskDataList = function() {
    storage.save("todoApp-taskDataList", taskDataList)
}

var loadTaskDataList = function() {
    taskDataList = storage.load("todoApp-taskDataList") || []
}

// Because object positioning uses the coordinate system.
var repositionTasks = function() {

    var top = 0

    for (var i = 0; i < taskList.length; i++) {
        taskList[i].top = top
        taskList[i].height = taskList[i].lblText.height + 20

        top += taskList[i].height
    }
}