function(instance, context) {




    // VARIABLE DEFINATIONS






    var el;
    var scrollY; // variable for getting current scroll position

    var userNames = [];
    var userIds = [];
    var userImages = [];

    instance.data.mentionedUsersName = []; // array for storing mentioned users name
    instance.data.mentionedUsersId = []; // array for storing mentioned users ID

    var menuWidth = 200;
    var paddingFromScreen = 20;

    let afterChar = 1;


    var emptyStateText = "User data not found!"

    var wholeListUploaded = false; // the whole list uploaded or not

    let currentIndex = 0; // for keyborad interactions

    var i;

    instance.data.searchText = "";
    instance.data.menu = document.getElementById("userMentionMenu");

    instance.data.inputType = "Input";


    // FUNCTION DEFINATIONS

    // this function checks which user selected and trigger the addMention function, and after that remove the menu
    var itemSelectionCheck = (e) => {

        var selectedEl = e.target;

        if (selectedEl.tagName !== 'P') {
            if (e.target.parentElement.tagName !== 'P') {
                selectedEl = selectedEl.parentElement.parentElement;
            } else {
                selectedEl = selectedEl.parentElement;
            }
        }


        if (selectedEl.id.includes("opt-")) { // We'd like to run the function only if a user item selected
            addMention(selectedEl.id);

        }

        var menu = document.getElementById("userMentionMenu");
        if (menu !== null) {
            removeGroupFocus(menu);
        }
    };

    // this function checks which element is clicked by the user
    var clickedElementIsMenu = (e) => { // adding an element listener do understand an element is clicked except menu

        if (!e.target.id.includes("userMentionMenu")) { // if the element is not the menu, we removing the menu
            var menu = document.getElementById("userMentionMenu");
            if (menu !== null) {
                removeGroupFocus(menu);
                document.removeEventListener('click', clickedElementIsMenu);
            }
        }
    }


    // REMOVE MENU IF THERE IS NO RESULT

    let emptyStateCounter = 0;

    const keyboardUpListener = (event) => {

        const menuOptions = instance.data.menu.querySelectorAll('.mention-visible');

            if(instance.data.menu && menuOptions.length == 0 && instance.data.searchText.length > 0 && event.key != 'Backspace'){
                emptyStateCounter++;
                if(emptyStateCounter == 2 + instance.data.afterChar){
                    emptyStateCounter = 0;
                    removeGroupFocus(instance.data.menu); 
                    // clear instance.data.searchText inside of remove Group Focus function
                }
            }else{
                emptyStateCounter = 0;
                
            }
       

    }



    const keyboardInteractions = (event) => {

        const menuOptions = instance.data.menu.querySelectorAll('.mention-visible');

        if (menuOptions.length > 0) {


            menuOptions[currentIndex].style.backgroundColor = "";


            if (event.key === 'ArrowDown') {
                currentIndex = (currentIndex + 1) % menuOptions.length;
                menuOptions[currentIndex].focus();
                menuOptions[currentIndex].style.backgroundColor = instance.data.theme_color;

                event.preventDefault();
                event.stopPropagation();
            } else if (event.key === 'ArrowUp') {
                currentIndex = (currentIndex - 1 + menuOptions.length) % menuOptions.length;
                menuOptions[currentIndex].focus();
                menuOptions[currentIndex].style.backgroundColor = instance.data.theme_color;

                event.preventDefault();
                event.stopPropagation();
            } else if (event.key === 'Enter') {

                addMention(menuOptions[currentIndex].id);
                event.preventDefault();
                if (instance.data.menu !== null) {
                    removeGroupFocus(instance.data.menu);
                    var richTextElement = document.querySelector(`#${el}`);

                    setTimeout(function () {
                        event.preventDefault();
                        richTextElement.focus();
                        const treeWalker = document.createTreeWalker(richTextElement, NodeFilter.SHOW_TEXT);
                        let lastTextNode = null;

                        while (treeWalker.nextNode()) {
                            lastTextNode = treeWalker.currentNode;
                        }

                        if (lastTextNode) {
                            const range = document.createRange();
                            range.setStart(lastTextNode, lastTextNode.length);
                            range.setEnd(lastTextNode, lastTextNode.length);

                            const selection = window.getSelection();
                            selection.removeAllRanges();
                            selection.addRange(range);
                        }
                    }, 200);

                }
            } else {
                currentIndex = 0;
                return;
            }



        }
    };

    // learn X Y positions of search text

    function getLineWidthsAndHeight(text, ctx, lineHeight) {
        const lines = text.split("\n");
        const lineWidths = lines.map((line) => ctx.measureText(line).width);

        return {
            lineWidths,
            lineHeight
        };
    }

    function setXY(menu) {
        /* const inputValue = instance.data.inputElement.value;
        const searchStr = "@" + instance.data.userInput
        const startIndex = inputValue.indexOf(searchStr); */

        const inputValue = instance.data.inputElement.value;
        const searchStr = "@" + instance.data.userInput;

        // Eşleşmenin hemen ardından bir harf veya boşluk gelmemesi gerektiğini belirten regex
        const regexPattern = searchStr.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&') + "(?![a-zA-Z0-9\\s\\W])";
        const regex = new RegExp(regexPattern);

        // Regex ile eşleşme arayışı
        const match = inputValue.match(regex);
        const startIndex = match ? match.index : -1; // Eşleşme varsa başlangıç indeksini, yoksa -1'i döndür


        const endIndex = startIndex + searchStr.length;

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const computedStyle = window.getComputedStyle(instance.data.inputElement);
        ctx.font = computedStyle.getPropertyValue("font");
        const lineHeight = parseFloat(computedStyle.getPropertyValue("line-height"));
        const { lineWidths: lineWidthsStart } = getLineWidthsAndHeight(inputValue.slice(0, startIndex), ctx, lineHeight);
        const { lineWidths: lineWidthsEnd } = getLineWidthsAndHeight(inputValue.slice(0, endIndex), ctx, lineHeight);



        const lineIndexStart = inputValue.slice(0, startIndex).split("\n").length - 1;
        const lineIndexEnd = inputValue.slice(0, endIndex).split("\n").length - 1;

        const inputBoundingClientRect = instance.data.inputElement.getBoundingClientRect();

        // get X position of input
        const xPosition = inputBoundingClientRect.left;


        const inputPaddingTop = parseInt(computedStyle.paddingTop, 10);
        const inputPaddingBot = parseInt(computedStyle.paddingBottom, 10);


        let startX = inputBoundingClientRect.left + lineWidthsStart[lineIndexStart];

        let endX = inputBoundingClientRect.left + lineWidthsEnd[lineIndexEnd];



        startX -= xPosition;
        endX -= xPosition;

        var x = startX;


        const cursorPosition = instance.data.inputElement.selectionStart;
        const textBeforeCaret = instance.data.inputElement.value.slice(0, cursorPosition);
        const linesBeforeCaret = textBeforeCaret.split('\n');

        // Padding ve margin değerlerini hesaba kat
        const paddingLeft = parseFloat(computedStyle.getPropertyValue('padding-left'));
        const paddingRight = parseFloat(computedStyle.getPropertyValue('padding-right'));
        const inputHeight = parseFloat(computedStyle.getPropertyValue('height'));

        const effectiveWidth = paddingLeft + paddingRight;

        let wrappedLines = 0;
        for (const line of linesBeforeCaret) {
            const lineWidth = ctx.measureText(line).width;
            const textareaWidth = instance.data.inputElement.clientWidth - effectiveWidth; // padding/margin değerlerini hesaba kat
            wrappedLines += Math.floor(lineWidth / textareaWidth);
        }


        const lineCounter = linesBeforeCaret.length + wrappedLines;

        let extraLineHeight = lineHeight * lineCounter;
        if (extraLineHeight > instance.data.inputElement.offsetHeight) {
            extraLineHeight = instance.data.inputElement.offsetHeight;
        }

        let startY = inputBoundingClientRect.top + extraLineHeight;
        let endY = inputBoundingClientRect.top + extraLineHeight;

        var y = startY;




        while (endX >= instance.data.inputWidth && instance.data.inputType == "Multiline") {


            endX %= instance.data.inputWidth;

            x = endX;



            y = startY;
        }

        if (endX >= instance.data.inputWidth && instance.data.inputType == "Input") {

            x = instance.data.inputWidth;
        }else if(endX < instance.data.inputWidth && instance.data.inputType == "Input"){
            x = endX;
        }

        x += xPosition;


        if (x + menuWidth >= instance.data.browserWidth) {
            x = instance.data.browserWidth - menuWidth - paddingFromScreen;

        }




        if (instance.data.inputType == "Input") {
            y = inputBoundingClientRect.top + inputHeight - inputPaddingBot - effectiveWidth;
        }

        y += (window.pageYOffset + effectiveWidth);




        menu.style.left = x + "px";
        menu.style.top = y + "px";
        instance.data.menuStyleTop = y;
    }

    // re-position menu

    function reposition(menu, pageH) {

        setXY(menu);

        const scrollTop = window.pageYOffset || document.documentElement.scrollTop; // Sayfanın yukarı doğru scroll miktarını alın

        let pageHeight = pageH;

        if (pageHeight == null) {
            pageHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight; // Sayfanın yüksekliğini alın
        }

        // input's Y value + input's height
        const inputTopHeight = instance.data.inputElement.getBoundingClientRect().top + instance.data.inputElement.getBoundingClientRect().height; // Butonun alt sınırının y değerini hesaplayın

        let y = pageHeight + scrollTop;

        if (menu.getBoundingClientRect().height + instance.data.menuStyleTop - scrollTop > pageHeight) {

            y -= menu.getBoundingClientRect().height + instance.data.paddingFromScreen;

            menu.style.top = y + "px";
        }



        if (parseInt(menu.style.left) < instance.data.paddingFromScreen) {

            menu.style.left = instance.data.paddingFromScreen + "px";
        }


    }

    function generateMenuItems() {

        // page height
        const pageHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight; // Sayfanın yüksekliğini alın; // Sayfanın yüksekliğini alın

        menu = instance.data.menu;
        instance.data.emptyState.style.display = "none"; // make the empty state invisible

        //const filteredUsers = userNames.filter(item => item.toLowerCase().startsWith(instance.data.searchText));
        const filteredUsers = userNames.filter(item => item && item.toLowerCase().startsWith(instance.data.searchText));

        for (var i = 0; i < filteredUsers.length; i++) {

            var uniqueElementId = "opt-" + i // creating a unique element ID, thus we can listen the object
            var userItem = document.createElement("p");

            userItem.style.padding = "6px";

            userItem.style.display = "table";


            userItem.style.fontFamily = instance.data.font_face.split(':::')[0] + ", sans-serif";
            userItem.style.fontWeight = instance.data.font_face.split(':::')[1];
            userItem.style.fontSize = instance.data.font_size + "px";
            userItem.style.color = instance.data.font_color;
            userItem.style.cursor = "pointer";

            if (!i) {
                userItem.style.backgroundColor = instance.data.theme_color;
            }

            userItem.style.width = '100%';

            userItem.setAttribute('id', uniqueElementId);
            userItem.setAttribute('data-username', filteredUsers[i].toLowerCase());
            userItem.setAttribute('tabindex', 0); // to enable keyboard interactions

            userItem.classList.add("mention-visible");


            userItem.onmouseover = function () {
                this.style.transition = "background-color 0.1s ease";
                this.style.backgroundColor = instance.data.theme_color;
            }

            userItem.onmouseout = function () {
                this.style.transition = "background-color 0.1s ease";
                this.style.backgroundColor = "";
            }

            userItem.onclick = function () {
                this.style.transition = "background-color 0.1s ease";
                this.style.backgroundColor = "";
            }

            var userRow = document.createElement("div");
            userRow.style.height = "auto";
            userRow.style.display = "table";

            if (userImages[i]) {
                var profileImg = document.createElement("img");
                profileImg.setAttribute('src', userImages[userNames.indexOf(filteredUsers[i])]);
                profileImg.style.width = "30px";
                profileImg.style.height = "30px";
                profileImg.style.borderRadius = "50%";
                profileImg.style.verticalAlign = "middle";
                profileImg.style.objectFit = "cover";
                userRow.appendChild(profileImg);
            }

            var nameText = document.createElement("span");
            nameText.innerHTML = filteredUsers[i];
            nameText.style.marginLeft = "10px";
            nameText.style.verticalAlign = "middle";


            userRow.appendChild(nameText);

            userItem.appendChild(userRow);

            menu.appendChild(userItem);
        }
        if (filteredUsers.length < 1) {
            showEmptyState();
        }

        reposition(menu, pageHeight);

    }

    function showEmptyState() {
        menu = instance.data.menu;

        instance.data.emptyState.style.display = "block";
        if (!menu.contains(instance.data.emptyState)) {
            menu.appendChild(instance.data.emptyState);
        }
    }

    instance.data.letterCount = 0;
    var searchText = "";



    var listenKeys = (e) => { // after the menu opened we listen all key inputs

        // indisi al 



        const inputValue = instance.data.inputElement.value;

        const atIndex = instance.data.caretIndex; // index of current '@'




        if (e.data !== '@' && instance.data.letterCount == 0) {
            instance.data.letterCount = 1
        }

        if (atIndex !== -1) {
            searchText = inputValue.substring(atIndex + 1, atIndex + 1 + instance.data.letterCount).toLowerCase();
            instance.data.userInput = inputValue.substring(atIndex + 1, atIndex + 1 + instance.data.letterCount);
        }



        instance.data.letterCount++;
        instance.data.searchText = searchText;



        // var menu = document.getElementById("userMentionMenu");
        var menu = instance.data.menu;

        // CHECKPOINT 1
        if (document.getElementById("userMentionMenu") !== null) { // if the menu is already open 
            var ps = menu.querySelectorAll('p[data-username*="' + searchText + '"]');
            var psNot = menu.querySelectorAll('p:not([data-username*="' + searchText + '"])');




            for (var i = 0; i < ps.length; i++) {

                ps[i].style.display = "block";
                ps[i].classList.add('mention-visible');

                if (!i) {
                    ps[i].style.backgroundColor = instance.data.theme_color;
                } else {
                    ps[i].style.backgroundColor = "none";
                }

            }

            for (var i = 0; i < psNot.length; i++) {

                psNot[i].style.display = "none";
                psNot[i].classList.remove('mention-visible');

            }

            if (menu.innerHTML.includes('display: block')) { // if there is at least one item that fits the search

                instance.data.emptyState.style.display = "none";

            }

            else if (instance.data.searchText.length > afterChar) { // if there is no item that fits the search

                showEmptyState();

            }

        }




        const childElements = menu.querySelectorAll("*");




        // if the menu is not opened yet and the search text has more than one character the menu will be visible

        if (document.getElementById("userMentionMenu") == null && instance.data.searchText.length > afterChar) {
            document.body.appendChild(menu);


            setXY(menu);

            generateMenuItems();
        }


        else if (document.getElementById("userMentionMenu") != null && instance.data.searchText.length > afterChar && childElements[1] === undefined) {

            generateMenuItems();
        }

        // if the searchText's number of character lower than limit, then all the p tags will be removed
        else if (childElements[1] !== undefined && instance.data.searchText.length <= afterChar) {

            childElements.forEach((child) => {
                if (child.id !== 'mentionEmptyState') {
                    //child.parentNode.removeChild(child);
                    child.remove();
                }
            });
        }

        // if the menu is visible but search line doesn'T contain '@' character, we are removing the menu
        if (!instance.data.inputElement.value.includes('@') && menu !== null) {
            removeGroupFocus(menu);

        }

        reposition(menu);
    }

    function removeGroupFocus(menu) {
        if (wholeListUploaded) {
            menu.parentNode.removeChild(menu);
            let richEditor = document.querySelector(`#${el}`); // related rich text editor
            richEditor.removeEventListener("input", listenKeys);
            instance.data.letterCount = 0;
            richEditor.focus();
        } else {
            menu.remove();
            let richEditor = document.querySelector(`#${el}`); // related rich text editor
            richEditor.removeEventListener("input", listenKeys);
            instance.data.letterCount = 0;
            richEditor.focus();
        }


        document.removeEventListener('keydown', keyboardInteractions);
        document.removeEventListener('keyup', keyboardUpListener);

        currentIndex = 0;

        instance.data.searchText = "";
    }

    function openGroupFocus() {

        // creating "menu" element here
        var menu = document.createElement("div");
        menu.setAttribute('id', "userMentionMenu"); // add the ID 
        menu.classList.add("dropdown-menu");
        menu.style.position = "absolute";
        menu.style.left = "0px";
        menu.style.top = "0px";
        menu.style.width = menuWidth + "px";
        menu.style.height = "auto";
        menu.style.maxHeight = "300px";
        menu.style.zIndex = "99999";
        menu.style.overflowY = "scroll";
        menu.style.overflowX = "hidden";
        menu.style.backgroundColor = instance.data.background_color;
        menu.style.boxShadow = "0px 4px 6px 0px rgba(0, 0, 0, 0.1)";
        menu.style.borderRadius = "4px";

        // creating "empty state" element here
        var emptyState = document.createElement("p");
        emptyState.setAttribute('id', 'mentionEmptyState');
        emptyState.innerHTML = emptyStateText;
        emptyState.style.fontFamily = instance.data.font_face.split(':::')[0] + ", sans-serif";
        emptyState.style.fontWeight = instance.data.font_face.split(':::')[1];
        emptyState.style.fontSize = instance.data.font_size + "px";
        emptyState.style.color = instance.data.font_color;
        emptyState.style.marginTop = "10px";
        emptyState.style.marginBottom = "10px";
        emptyState.style.marginLeft = "10px";
        emptyState.style.display = "none";

        instance.data.emptyState = emptyState;
        instance.data.menu = menu;


        menu.addEventListener('click', itemSelectionCheck);

        document.addEventListener('click', clickedElementIsMenu);

        document.addEventListener('keydown', keyboardInteractions);
        document.addEventListener('keyup', keyboardUpListener);

        // adding user items into the menu



        let richEditor = document.querySelector(`#${el}`); // related rich text editor



        // richEditor.addEventListener("input", listenKeys(menu));
        richEditor.addEventListener("input", listenKeys);

        window.addEventListener('scroll', function () {
            reposition(menu);
        });
    }

    function addMention(elementId) { // add the selected users name into the input

        var selectedElement = document.querySelector(`#${elementId} > div > span`);

        var theUsersName = selectedElement.innerHTML;

        // Kullanıcının ID'sini al
        var theUserId = userIds[userNames.indexOf(theUsersName)];

        instance.publishState('latestUserName', theUsersName);
        instance.publishState('latestUserId', theUserId);

                // Eğer bu kullanıcı daha önce mentionlanmamışsa listelere ekle
        if (!instance.data.mentionedUsersId.includes(theUserId)) {
            instance.data.mentionedUsersName.push(theUsersName);
            instance.data.mentionedUsersId.push(theUserId);

            instance.publishState('mentionedUsersId', instance.data.mentionedUsersId);
            instance.publishState('mentionedUsersName', instance.data.mentionedUsersName);
        }

        /* instance.data.mentionedUsersName.push(theUsersName); // adding the mentioned user's name to mentioned users name list
        instance.data.mentionedUsersId.push(userIds[userNames.indexOf(theUsersName)]); // adding the mentioned user's uid to mentioned users ID list

        instance.publishState('mentionedUsersId', instance.data.mentionedUsersId);
        instance.publishState('mentionedUsersName', instance.data.mentionedUsersName); */

        let mentionStart =  "@"+ instance.data.userInput;

        const regexPattern = mentionStart.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&') + "(?![a-zA-Z0-9.,;:!?()])";

        const regex = new RegExp(regexPattern, 'g');
        instance.data.inputElement.value = instance.data.inputElement.value.replace(regex, "@" + theUsersName + " ");
        // instance.data.inputElement.value = instance.data.inputElement.value.replace("@" + instance.data.userInput, "@" + theUsersName + " ");

        instance.triggerEvent('mention_added');


        instance.data.inputElement.focus();

    }

    var listStart = 0;
    var uploadingList = true;

    // AFTER GETTING PROPERTIES FROM THE "UPDATE" FUNCTION
    instance.data.triggerMe = (properties) => {



        instance.data.ready = false;

        instance.data.font_face = properties.bubble.font_face();
        instance.data.font_color = properties.bubble.font_color();
        instance.data.font_size = properties.bubble.font_size();
        instance.data.background_color = properties.backgroundColor;
        instance.data.theme_color = properties.themeColor;

        instance.data.inputElement = document.getElementById(`${el}`);



        // INSTANT INPUT FUNCTION @@@@@@@@@@@@@@@@@@@@@@@@@

        if (instance.data.inputElement) { // after getting input element
            let intervalId; // to break interval function
            let lastValue = ""; // to store latest value of the input


            instance.data.inputElement.addEventListener('focus', function () { // listen whether the input is focused or not
                intervalId = setInterval(function () {
                    instance.publishState('instantValue', instance.data.inputElement.value); // publish latest value of the input
                    if (lastValue != instance.data.inputElement.value) { // if the input value has changed, then trigger an event
                        instance.triggerEvent('instantValueHasChanged');
                        lastValue = instance.data.inputElement.value;
                        // UPDATE MENTION LIST @@@@@@@@@@@@@@@@@

                        const usersName = instance.data.mentionedUsersName; // get mentioned users name
                        const usersId = instance.data.mentionedUsersId; // get mentioned user id

                            for (var i = usersName.length - 1; i >= 0; i--) {

                                if (!instance.data.inputElement.value.includes('@' + usersName[i])) { // if the current value doesnt contain the user

                                    usersName.splice(i, 1);
                                    usersId.splice(i, 1);

                                }

                            }

                        instance.data.mentionedUsersName = usersName; // update instance
                        instance.data.mentionedUsersId = usersId; // update instance
 
                        instance.publishState('mentionedUsersName', usersName); // publish mentioned users name
                        instance.publishState('mentionedUsersId', usersId); // publish mentioned users id
                    }

                }, 500);
            });

            // Input focusunu kaybettiğinde setInterval durdur
            instance.data.inputElement.addEventListener('blur', function () {
                clearInterval(intervalId);
            });
        }




        instance.data.inputType = properties.inputType;

        menuWidth = properties.menuWidth;
        paddingFromScreen = properties.paddingFromScreen;
        instance.data.paddingFromScreen = paddingFromScreen;

        emptyStateText = properties.emptyStateText;

        el = properties.elementId;
        instance.data.elementId = el;

        scrollY = window.pageYOffset; // get current scroll position



        afterChar = properties.afterChar - 1;
        instance.data.afterChar = afterChar;

        var addUserImages = properties.userImages;

        while (uploadingList) {

            var allUserNames = properties.userNames.get(listStart, 1000);
            var allUserIds = properties.userIds.get(listStart, 1000);

            if (allUserNames[0] == undefined) {

                uploadingList = false;
                wholeListUploaded = true;

            } else {

                userNames = userNames.concat(allUserNames);
                userIds = userIds.concat(allUserIds);

                if (addUserImages) {

                    var allUserImages = properties.userImages.get(listStart, 1000);
                    userImages = userImages.concat(allUserImages);

                }

                listStart += 1000;

            }


        }


    }


    // LISTENER DEFINATIONS


    document.addEventListener('input', function (event) {


        if(!instance.data.inputElement){
            instance.data.inputElement = document.getElementById(`${el}`);

        }
        
        const caretIndex = instance.data.inputElement.selectionStart;

        const content = instance.data.inputElement.value;


        if (event.data === '@' && (caretIndex == 1 || content[caretIndex - 2] === ' ' || content[caretIndex - 2] === '\n')) {
            if (document.activeElement === document.getElementById(el)) {
                instance.data.caretIndex = caretIndex - 1; // index of '@'
                openGroupFocus();
            }

        }
    });




}