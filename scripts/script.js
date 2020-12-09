/* declare constants */
const BACKEND_URL = "http://localhost:3000"



var topicId = '5fcf8063dc142d27a490317a'
var isLoggedIn = true
var isAdmin = true
var email = "rcmadhankumar@gmail.com";
var userName = "Madhankumar Chellamuthu";

var pageSize = 5;
var currPageNo = 0;
var maxLeft = null;
var maxRight = null;
var fromDate = null;
var tooDate = null;
var thisPage = "topics";

function convertDate(dateText)
{
    let created_date = new Date(dateText);

    let months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    let year = created_date.getFullYear();
    let month = months[created_date.getMonth()];
    let date = created_date.getDate();
    let [hour, mer] = created_date.getHours()>12?[created_date.getHours()%12, "PM"]: [created_date.getHours(), "AM"];
    let min = created_date.getMinutes();
    let sec = created_date.getSeconds();
    let time = date + ',' + month + ' ' + year + ' ' + hour + ':' + min + " " + mer;
    return time
}

function changePageSize(value)
{
    
    pageSize = value;
    currPageNo = 0;
    loadContent();
    
}

function changePageSizeForTopics(value)
{
    
    pageSize = value;
    currPageNo = 0;
    loadTopics();
    
}

function changePage(item)
{
    currPageNo = item-1
    if(thisPage==="content") loadContent();
    else loadTopics();
}

function changeFromDate()
{
    let fromDateValue = document.getElementById("fromDate").value;
    fromDate = fromDateValue;
    loadContent();
}

function changeToDate()
{
    let toDateValue = document.getElementById("toDate").value;
    tooDate = toDateValue;
    loadContent();
}

function paginate(contentData)
{
    let totalPages = Math.ceil(contentData.length/pageSize);
    console.log("===== content Length ====", contentData.length)
    console.log("Total pages: ", totalPages)
    let maxLeft = currPageNo -2;
    let maxRight = currPageNo + 2;

    let paginationBar = document.getElementById("pages");
    paginationBar.innerHTML = "";

    /* Adding previous page pointer */
    let prev = document.createElement("li");
    prev.classList.add("page-item");
    let prevLink = document.createElement("a");
    prevLink.setAttribute("onclick", "changePage(" + (currPageNo) + ")" )
    prevLink.classList.add("page-link");
    prevLink.innerText = "Previous";
    prev.append(prevLink);
    paginationBar.append(prev);

    if (maxLeft < 0) {
        maxLeft = 0;
        maxRight = 4;
    }
    if(maxRight>totalPages)
    {
        maxRight = totalPages;
    }

    if(currPageNo <= 0)
    {
        prev.classList.add("disabled");
        prev.children[0].setAttribute("tab-index", "-1")
    }
    
    
    for(let i=maxLeft;i<maxRight;i++)
    {
        let btn = document.createElement("li");
        btn.classList.add("page-item");
        if(i===currPageNo)
        {
            btn.classList.add("active")
        }
        let btnLink = document.createElement("a");
        btnLink.setAttribute("onclick", "changePage(this.innerText)")
        btnLink.classList.add("page-link");
        btnLink.innerText = i+1;
        btn.append(btnLink);
        paginationBar.append(btn);
    }

    let next = document.createElement("li");
    next.classList.add("page-item");
    let nextLink = document.createElement("a");
    
    nextLink.setAttribute("onclick", "changePage(" + (currPageNo+2) + ")")
    nextLink.classList.add("page-link");
    nextLink.innerText = "Next";
    next.append(nextLink);
    paginationBar.append(next);

    console.log(totalPages, "-", currPageNo)
    if(currPageNo >= totalPages-1)
    {
        
        next.classList.add("disabled");
        next.children[0].setAttribute("tab-index", "-1")
    }

    let start = (currPageNo*pageSize);
    let end = (currPageNo*pageSize) + pageSize;
    end = end>contentData.length?contentData.length:end;
    return [start, end]
}

function addReplySection()
{
    if(!isLoggedIn)
        document.getElementById("replySection").style.display = "none";

}

function enableButton()
{
    let text = document.getElementById("replyTextArea").value;
    if(text.length>10) document.getElementById("addButton").disabled= false;
    else document.getElementById("addButton").disabled = true;
}

function enableCreateButton()
{
    let text = document.getElementById("topicNameInput").value;
    if(text.length>10) document.getElementById("createButton").disabled= false;
    else document.getElementById("createButton").disabled = true;
}
function createTopic()
{
    let data = {
        topic: document.getElementById("topicNameInput").value,
        email, 
        userName
    }
    console.log(data)
    fetch(BACKEND_URL + "/topics", {
        method: "POST",
        body: JSON.stringify(data),
        "headers": {
            "Content-type": "application/json"
        } 
    }).then(res=>res.json())
    .then(res => {
        console.log(res);
        
        document.getElementById("alertDiv").style.display = "block";
        document.getElementById("alertDiv").classList = "";
        if(! res.result)
            document.getElementById("alertDiv").classList.add("alert", "alert-danger");
        else
            document.getElementById("alertDiv").classList.add("alert", "alert-success");

        document.getElementById("alertText").innerText = res.message;
        document.getElementById("topicNameInput").value = "";
    })

}


function reply()
{
    let data = {
        reply: document.getElementById("replyTextArea").value,
        email: email,
        userName: userName
    }
    console.log(data)
    fetch(BACKEND_URL + "/topics/" + topicId, {
        method: "POST",
        body: JSON.stringify(data),
        "headers": {
            "Content-type": "application/json"
        } 
    }).then(res=>res.json())
    .then(res => {
        console.log(res);
        loadContent()
        
    })
    
    document.getElementById("topicSection").scrollIntoView(true);
    
}
function deleteReply(idx)
{
    let data = {
        idx
    }
    fetch(BACKEND_URL + "/topics/" + topicId, {
        method: "DELETE",
        body: JSON.stringify(data),
        "headers": {
            "Content-type": "application/json"
        } 
    }).then(res=>res.json())
    .then(res => {
        console.log(res);
    })
    let contentDiv = document.getElementById("contentDiv" + idx);
    contentDiv.style.display = "none";

}

function updateContent(idx)
{
    alert(idx);
    let data = {
        idx,
        reply: document.getElementById("replyTextArea").value
    }
    
    fetch(BACKEND_URL + "/topics/" + topicId, {
        method: "PUT",
        body: JSON.stringify(data),
        "headers": {
            "Content-type": "application/json"
        } 
    }).then(res=>res.json())
    .then(res => {
        console.log(res);
        loadContent();
        document.getElementById("replyTextArea").value = "";
        document.getElementById("addButton").disabled = true;
         document.getElementById("replyTextAreaLabel").innerText = "Add a reply: (minimum comment length is 10)";
        document.getElementById("addButton").innerText = "Comment";
        document.getElementById("addButton").setAttribute("onclick", "reply()");
        document.getElementById("cp-" + idx).scrollIntoView(true);
        

    })
    
}

function editContent(idx)
{
    document.getElementById("replyTextArea").value = document.getElementById("cp-" + idx).innerHTML;
    document.getElementById("replyTextArea").scrollIntoView(true);
    document.getElementById("replyTextAreaLabel").innerText = "Edit:";
    document.getElementById("addButton").innerText = "Edit";
    document.getElementById("addButton").setAttribute("onclick", "updateContent("+ idx + ")");

}

function loadContent()
{
    thisPage = "content"
    let queryStringValue = "";
    if(fromDate || tooDate)
    {   queryStringValue = "?";
    console.log(fromDate, "-", toDate)
        if(fromDate)
        {
            queryStringValue = queryStringValue + "fromDate=" + fromDate;
            if(tooDate)
            {
                queryStringValue = queryStringValue + "&&toDate=" + tooDate;
            }
        }
        else{
            queryStringValue = queryStringValue + "toDate=" + tooDate;
        }
        
    }
    
    
    
    addReplySection();
    console.log(queryStringValue)
    fetch(BACKEND_URL + "/topics/" + topicId + queryStringValue)
    .then(res => res.json())
    .then( res => {
        
        let data = res.body;

        //  Adding topic to the top of the page
        document.getElementById("topicSection").innerText = data.topic;
        if(res.body.discussion.length===0)
        {

        }
        let contentData = res.body.discussion;
        let [start, end] = paginate(contentData);
        console.log(start, end)

        // Creating a content section
        let reqData = res.body.discussion.slice(start, end);
        console.log(reqData);
        document.getElementById("contentSection").innerHTML = "";
        let idx = (currPageNo*pageSize);
        reqData.forEach(reply => {

            let contentDiv = document.createElement("div");
            contentDiv.classList.add("contentDiv", "shadow", "rounded", "p-3", "mb-5");
            contentDiv.id = "contentDiv" + idx ;

            let contentRow = document.createElement("div");
            contentRow.classList.add("row");
            let contentCol = document.createElement("div");
            contentCol.classList.add("col-12");
            contentRow.append(contentCol);

            

            let contentParagraph = document.createElement("p");
            contentParagraph.id = "cp-" + idx;
            contentParagraph.innerText = reply.reply;
            let contentDetailsRow = document.createElement("div");
            contentDetailsRow.classList.add("row");
            contentCol.append(contentParagraph, contentDetailsRow);

            let contentUser = document.createElement("div");
            contentUser.classList.add("col-6", "text-left", "p-2");
            contentDetailsRow.append(contentUser);

            let userNameH = document.createElement("h4");
            userNameH.innerText = reply.userName;
            let replyTime = document.createElement("p");
            replyTime = convertDate(reply.createdOn);
            contentUser.append(userNameH, replyTime);

            
            if(isLoggedIn)
            {
                
                let contentOps = document.createElement("div");
                contentOps.classList.add("actionButtons", "col-6", "text-right", "p-2");
                let editButton = document.createElement("button");
                editButton.classList.add("btn", "btn-primary")
                editButton.innerText = "Edit"
                editButton.setAttribute("onclick","editContent("+ idx + ")");
                contentOps.append(editButton);

                if(isAdmin)
                {
                    let deleteButton = document.createElement("button");
                    deleteButton.classList.add("btn", "btn-warning")
                    deleteButton.value = idx;
                    deleteButton.setAttribute("onclick", "deleteReply("+ idx + ")")
                    deleteButton.innerText = "Delete"
                    contentOps.append(deleteButton);
                }

                contentDetailsRow.append(contentOps);
            }
            contentDiv.append(contentRow);
            document.getElementById("contentSection").append(contentDiv);
            idx++;
            
        });
        document.getElementById("replyTextArea").value = "";
        document.getElementById("addButton").disabled = true;
        
    });
    
}


function loadTopics()
{
    thisPage = "topics"
    let queryStringValue = "";
    console.log(queryStringValue)
    fetch(BACKEND_URL + "/topics" + queryStringValue)
    .then(res => res.json())
    .then( res => {
        console.log(res)
        let data = res.body;

        if(data.length===0)
        {

        }
        let contentData = data;
        let [start, end] = paginate(contentData, load="topics");
        console.log(start, end)

        // Creating a content section
        let reqData = data.slice(start, end);
        console.log(reqData);
        document.getElementById("contentSection").innerHTML = "";
        let idx = (currPageNo*pageSize);
        reqData.forEach(topicCollection => {

            let contentDiv = document.createElement("div");
            contentDiv.classList.add("contentDiv", "shadow", "rounded", "p-3", "mb-5");
            contentDiv.id = "contentDiv" + idx ;

            let contentRow = document.createElement("div");
            contentRow.classList.add("row");
            let contentCol = document.createElement("div");
            contentCol.classList.add("col-12");
            contentRow.append(contentCol);

            

            let topicLink = document.createElement("a");

            topicLink.href = "viewContent.html?topicId=" + topicCollection._id;
            topicLink.innerText = (idx+1) + "." + topicCollection.topic;
            contentCol.append(topicLink);

                        
            // if(isLoggedIn)
            // {
                
            //     let contentOps = document.createElement("div");
            //     contentOps.classList.add("actionButtons", "col-6", "text-right", "p-2");
            //     let editButton = document.createElement("button");
            //     editButton.classList.add("btn", "btn-primary")
            //     editButton.innerText = "Edit"
            //     editButton.setAttribute("onclick","editContent("+ idx + ")");
            //     contentOps.append(editButton);

            //     if(isAdmin)
            //     {
            //         let deleteButton = document.createElement("button");
            //         deleteButton.classList.add("btn", "btn-warning")
            //         deleteButton.value = idx;
            //         deleteButton.setAttribute("onclick", "deleteReply("+ idx + ")")
            //         deleteButton.innerText = "Delete"
            //         contentOps.append(deleteButton);
            //     }

            //     contentDetailsRow.append(contentOps);
            // }
            contentDiv.append(contentRow);
            document.getElementById("contentSection").append(contentDiv);
            idx++;
        });
        
        
    });
    
}