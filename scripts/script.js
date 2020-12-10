const BACKEND_URL = "https://discussion-forum-by-madhan.herokuapp.com";

var topicId = "";
var isLoggedIn = false;
var isAdmin = false;
var email = null;
var userName = null;
var role = null;
var pageSize = 5;
var currPageNo = 0;
var maxLeft = null;
var maxRight = null;
var fromDate = null;
var tooDate = null;
var thisPage = "topics";
var DFToken = "";

async function getUserInfo() {
    if (sessionStorage.getItem("DFToken")) {
        let token = sessionStorage.getItem("DFToken");
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("authorization", token);
        try {
            let res = await fetch(BACKEND_URL + "/checkLogin", {
                headers: myHeaders,
            }).then((res) => res.json());

            console.log(res);
            if (!res.result) return;

            userName = res.body.userName;
            email = res.body.email;
            role = res.body.role;
            if (res.body.role === "adminUser") {
                isAdmin = true;
            } else {
                isAdmin = false;
            }
            isLoggedIn = true;
            return;
        } catch (err) {
            console.log(err);
        }
    } else {
        userName = null;
        email = null;
        isAdmin = false;
        isLoggedIn = false;
        return;
    }
}

function convertDate(dateText) {
    let created_date = new Date(dateText);

    let months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
    ];
    let year = created_date.getFullYear();
    let month = months[created_date.getMonth()];
    let date = created_date.getDate();
    let [hour, mer] =
        created_date.getHours() > 12
            ? [created_date.getHours() % 12, "PM"]
            : [created_date.getHours(), "AM"];
    let min = created_date.getMinutes();
    let sec = created_date.getSeconds();
    let time =
        date + "," + month + " " + year + " " + hour + ":" + min + " " + mer;
    return time;
}

function changePageSize(value) {
    pageSize = value;
    currPageNo = 0;
    loadContent();
}

function changePageSizeForTopics(value) {
    pageSize = value;
    currPageNo = 0;
    loadTopics();
}

function changePage(item) {
    currPageNo = item - 1;
    if (thisPage === "content") loadContent();
    else loadTopics();
}

function changeFromDate() {
    let fromDateValue = document.getElementById("fromDate").value;
    fromDate = fromDateValue;
    loadContent();
}

function changeToDate() {
    let toDateValue = document.getElementById("toDate").value;
    tooDate = toDateValue;
    loadContent();
}

function paginate(contentData) {
    let totalPages = Math.ceil(contentData.length / pageSize);
    console.log("===== content Length ====", contentData.length);
    console.log("Total pages: ", totalPages);
    let maxLeft = currPageNo - 2;
    let maxRight = currPageNo + 2;

    let paginationBar = document.getElementById("pages");
    paginationBar.innerHTML = "";

    /* Adding previous page pointer */
    let prev = document.createElement("li");
    prev.classList.add("page-item");
    let prevLink = document.createElement("a");
    prevLink.setAttribute("onclick", "changePage(" + currPageNo + ")");
    prevLink.classList.add("page-link");
    prevLink.innerText = "Previous";
    prev.append(prevLink);
    paginationBar.append(prev);

    if (maxLeft < 0) {
        maxLeft = 0;
        maxRight = 4;
    }
    if (maxRight > totalPages) {
        maxRight = totalPages;
    }

    if (currPageNo <= 0) {
        prev.classList.add("disabled");
        prev.children[0].setAttribute("tab-index", "-1");
    }

    for (let i = maxLeft; i < maxRight; i++) {
        let btn = document.createElement("li");
        btn.classList.add("page-item");
        if (i === currPageNo) {
            btn.classList.add("active");
        }
        let btnLink = document.createElement("a");
        btnLink.setAttribute("onclick", "changePage(this.innerText)");
        btnLink.classList.add("page-link");
        btnLink.innerText = i + 1;
        btn.append(btnLink);
        paginationBar.append(btn);
    }

    let next = document.createElement("li");
    next.classList.add("page-item");
    let nextLink = document.createElement("a");

    nextLink.setAttribute("onclick", "changePage(" + (currPageNo + 2) + ")");
    nextLink.classList.add("page-link");
    nextLink.innerText = "Next";
    next.append(nextLink);
    paginationBar.append(next);

    console.log(totalPages, "-", currPageNo);
    if (currPageNo >= totalPages - 1) {
        next.classList.add("disabled");
        next.children[0].setAttribute("tab-index", "-1");
    }

    let start = currPageNo * pageSize;
    let end = currPageNo * pageSize + pageSize;
    end = end > contentData.length ? contentData.length : end;
    return [start, end];
}

function addReplySection() {
    if (!isLoggedIn)
        if (document.getElementById("replySection"))
            document.getElementById("replySection").style.display = "none";
}

function enableButton() {
    let text = document.getElementById("replyTextArea").value;
    if (text.length > 10) document.getElementById("addButton").disabled = false;
    else document.getElementById("addButton").disabled = true;
}

function enableCreateButton() {
    let text = document.getElementById("topicNameInput").value;
    if (text.length > 10)
        document.getElementById("createButton").disabled = false;
    else document.getElementById("createButton").disabled = true;
}
async function createTopic() {
    let res = await getUserInfo();
    let data = {
        topic: document.getElementById("topicNameInput").value,
        email,
        userName,
        role,
    };
    let token = sessionStorage.getItem("DFToken");
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("authorization", token);

    fetch(BACKEND_URL + "/topics", {
        method: "POST",
        body: JSON.stringify(data),
        headers: myHeaders,
    })
        .then((res) => res.json())
        .then((res) => {
            console.log(res);

            document.getElementById("alertDiv").style.display = "block";
            document.getElementById("alertDiv").classList = "";
            if (!res.result)
                document
                    .getElementById("alertDiv")
                    .classList.add("alert", "alert-danger");
            else
                document
                    .getElementById("alertDiv")
                    .classList.add("alert", "alert-success");

            document.getElementById("alertText").innerText = res.message;
            document.getElementById("topicNameInput").value = "";
        });
}

function reply() {
    let data = {
        reply: document.getElementById("replyTextArea").value,
        email: email,
        userName: userName,
        role,
    };
    let token = sessionStorage.getItem("DFToken");
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("authorization", token);
    console.log(data);
    console.log(data);
    fetch(BACKEND_URL + "/topics/" + topicId, {
        method: "POST",
        body: JSON.stringify(data),
        headers: myHeaders,
    })
        .then((res) => res.json())
        .then((res) => {
            console.log(res);
            loadContent();
        });

    document.getElementById("topicSection").scrollIntoView(true);
}
function deleteReply(idx) {
    let data = {
        idx,
        role,
    };
    let token = sessionStorage.getItem("DFToken");
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("authorization", token);

    fetch(BACKEND_URL + "/topics/" + topicId, {
        method: "DELETE",
        body: JSON.stringify(data),
        headers: myHeaders,
    })
        .then((res) => res.json())
        .then((res) => {
            console.log(res);
        });
    let contentDiv = document.getElementById("contentDiv" + idx);
    contentDiv.style.display = "none";
}

function updateContent(idx) {
    let data = {
        idx,
        reply: document.getElementById("replyTextArea").value,
        role: role,
    };
    let token = sessionStorage.getItem("DFToken");
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("authorization", token);

    fetch(BACKEND_URL + "/topics/" + topicId, {
        method: "PUT",
        body: JSON.stringify(data),
        headers: myHeaders,
    })
        .then((res) => res.json())
        .then((res) => {
            console.log(res);
            loadContent();
            document.getElementById("replyTextArea").value = "";
            document.getElementById("addButton").disabled = true;
            document.getElementById("replyTextAreaLabel").innerText =
                "Add a reply: (minimum comment length is 10)";
            document.getElementById("addButton").innerText = "Comment";
            document
                .getElementById("addButton")
                .setAttribute("onclick", "reply()");
            document.getElementById("cp-" + idx).scrollIntoView(true);
        });
}

function editContent(idx) {
    document.getElementById("replyTextArea").value = document.getElementById(
        "cp-" + idx
    ).innerHTML;
    document.getElementById("replyTextArea").scrollIntoView(true);
    document.getElementById("replyTextAreaLabel").innerText = "Edit:";
    document.getElementById("addButton").innerText = "Edit";
    document
        .getElementById("addButton")
        .setAttribute("onclick", "updateContent(" + idx + ")");
}

async function loadContent() {
    let res = await getUserInfo();
    console.log("isLoggedIn", isLoggedIn);
    if (isLoggedIn) {
        document.getElementById("logoutButton").style.display = "inline";
        document.getElementById("createTopics").classList.remove("disabled");
        document.getElementById("registerButton").style.display = "none";
        document.getElementById("loginButton").style.display = "none";
    } else {
        document.getElementById("logoutButton").style.display = "none";
        document.getElementById("createTopics").classList.add("disabled");
        document.getElementById("registerButton").style.display = "inline";
        document.getElementById("loginButton").style.display = "inline";
    }

    thisPage = "content";
    let queryStringValue = "";
    if (fromDate || tooDate) {
        queryStringValue = "?";
        console.log(fromDate, "-", toDate);
        if (fromDate) {
            queryStringValue = queryStringValue + "fromDate=" + fromDate;
            if (tooDate) {
                queryStringValue = queryStringValue + "&&toDate=" + tooDate;
            }
        } else {
            queryStringValue = queryStringValue + "toDate=" + tooDate;
        }
    }

    addReplySection();
    topicId = "";
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("topicId")) topicId = urlParams.get("topicId");
    if (!topicId) {
        document.getElementById("alertDiv").style.display = "block";
        document.getElementById("alertDiv").classList = "";
        document
            .getElementById("alertDiv")
            .classList.add("alert", "alert-warning");
        document.getElementById("alertText").innerText =
            "Please search your topic !";

        if (document.getElementById("replySection"))
            document.getElementById("replySection").style.display = "none";
        return;
    }
    console.log(queryStringValue);
    fetch(BACKEND_URL + "/topics/" + topicId + queryStringValue)
        .then((res) => res.json())
        .then((res) => {
            console.log("topic id: ", topicId);
            let data = res.body;
            console.log("data", data);
            if (!data) {
                document.getElementById("alertDiv").style.display = "block";
                document.getElementById("alertDiv").classList = "";
                document
                    .getElementById("alertDiv")
                    .classList.add("alert", "alert-danger");
                document.getElementById("alertText").innerText =
                    "Invalid topic Id: Please type a valid URL";
                document.getElementById("replySection").style.display = "none";
                return;
            }
            //  Adding topic to the top of the page
            document.getElementById("topicSection").innerText = data.topic;

            if (!res.result) {
                document.getElementById("alertDiv").style.display = "block";
                document.getElementById("alertDiv").classList = "";
                document
                    .getElementById("alertDiv")
                    .classList.add("alert", "alert-danger");
                document.getElementById("alertText").innerText = res.message;
                return;
            }
            if (res.body.discussion.length === 0) {
                document.getElementById("alertDiv").style.display = "block";
                document.getElementById("alertDiv").classList = "";
                document
                    .getElementById("alertDiv")
                    .classList.add("alert", "alert-danger");
                document.getElementById("alertText").innerText =
                    "0 Discussions found";
            }

            document.getElementById("alertDiv").style.display = "block";
            document.getElementById("alertDiv").classList = "";
            document
                .getElementById("alertDiv")
                .classList.add("alert", "alert-success");
            document.getElementById("alertText").innerText =
                res.body.discussion.length + " results found";

            let contentData = res.body.discussion;
            let [start, end] = paginate(contentData);
            console.log(start, end);

            // Creating a content section
            let reqData = res.body.discussion.slice(start, end);
            console.log(reqData);
            document.getElementById("contentSection").innerHTML = "";
            let idx = currPageNo * pageSize;
            reqData.forEach((reply) => {
                let contentDiv = document.createElement("div");
                contentDiv.classList.add(
                    "contentDiv",
                    "shadow",
                    "rounded",
                    "p-3",
                    "mb-5"
                );
                contentDiv.id = "contentDiv" + idx;

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

                if (isLoggedIn) {
                    let contentOps = document.createElement("div");
                    contentOps.classList.add(
                        "actionButtons",
                        "col-6",
                        "text-right",
                        "p-2"
                    );
                    if (reply.userName === userName || isAdmin) {
                        let editButton = document.createElement("button");
                        editButton.classList.add("btn", "btn-primary");
                        editButton.innerText = "Edit";
                        editButton.setAttribute(
                            "onclick",
                            "editContent(" + idx + ")"
                        );
                        contentOps.append(editButton);
                    }

                    if (isAdmin) {
                        let deleteButton = document.createElement("button");
                        deleteButton.classList.add("btn", "btn-warning");
                        deleteButton.value = idx;
                        deleteButton.setAttribute(
                            "onclick",
                            "deleteReply(" + idx + ")"
                        );
                        deleteButton.innerText = "Delete";
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
function registerUser() {
    let userName = document.getElementById("name").value;
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;
    let data = {
        userName,
        email,
        password,
    };
    fetch(BACKEND_URL + "/register", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            "Content-type": "application/json",
        },
    })
        .then((res) => res.json())
        .then((res) => {
            document.getElementById("registerAlertDiv").style.display = "block";
            document.getElementById("registerAlertDiv").classList = "";
            document.getElementById("registerAlertText").innerText =
                res.message;
            if (!res.result) {
                document
                    .getElementById("registerAlertDiv")
                    .classList.add("alert", "alert-danger");
            } else {
                document
                    .getElementById("registerAlertDiv")
                    .classList.add("alert", "alert-success");
            }
        });
}

function loginUser() {
    let email = document.getElementById("loginEmail").value;
    let password = document.getElementById("loginPassword").value;
    let data = {
        userName,
        email,
        password,
    };
    fetch(BACKEND_URL + "/login", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            "Content-type": "application/json",
        },
    })
        .then((res) => res.json())
        .then((res) => {
            document.getElementById("loginAlertDiv").style.display = "block";
            document.getElementById("loginAlertDiv").classList = "";
            document.getElementById("loginAlertText").innerText = res.message;
            if (!res.result) {
                document
                    .getElementById("loginAlertDiv")
                    .classList.add("alert", "alert-danger");
            } else {
                document
                    .getElementById("loginAlertDiv")
                    .classList.add("alert", "alert-success");
            }
            console.log(res);
            sessionStorage.setItem("DFToken", res.token);
            loadContent();
        });
}

function logout() {
    sessionStorage.removeItem("DFToken");
    window.location.href = "index.html";
}
function searchTextFn() {
    let searchText = document.getElementById("searchText").value;
    if (searchText) {
        window.location.href = "index.html?search=" + searchText;
    }
    document.getElementById("searchText").value = "";
}

async function loadTopics() {
    let res = await getUserInfo();

    console.log("isLoggedIn", isLoggedIn);
    if (isLoggedIn) {
        document.getElementById("logoutButton").style.display = "inline";
        document.getElementById("createTopics").classList.remove("disabled");
        document.getElementById("registerButton").style.display = "none";
        document.getElementById("loginButton").style.display = "none";
    } else {
        document.getElementById("logoutButton").style.display = "none";
        document.getElementById("createTopics").classList.add("disabled");
        document.getElementById("registerButton").style.display = "inline";
        document.getElementById("loginButton").style.display = "inline";
    }

    const urlParams = new URLSearchParams(window.location.search);
    let searchText = "";
    if (urlParams.get("search")) searchText = urlParams.get("search");

    thisPage = "topics";

    let queryStringValue = "";
    if (searchText) {
        queryStringValue = "?search=" + searchText;
    }
    console.log(queryStringValue);
    fetch(BACKEND_URL + "/topics" + queryStringValue)
        .then((res) => res.json())
        .then((res) => {
            console.log(res);
            let data = res.body;
            if (!res.result) {
                document.getElementById("alertDiv").style.display = "block";
                document.getElementById("alertDiv").classList = "";
                document
                    .getElementById("alertDiv")
                    .classList.add("alert", "alert-danger");
                document.getElementById("alertText").innerText = res.message;
                return;
            }
            if (data.length === 0) {
                document.getElementById("alertDiv").style.display = "block";
                document.getElementById("alertDiv").classList = "";
                document
                    .getElementById("alertDiv")
                    .classList.add("alert", "alert-danger");
                document.getElementById("alertText").innerText =
                    "0 results found";
                return;
            }

            let contentData = data;
            document.getElementById("alertDiv").style.display = "block";
            document.getElementById("alertDiv").classList = "";
            document
                .getElementById("alertDiv")
                .classList.add("alert", "alert-success");
            document.getElementById("alertText").innerText =
                data.length + " results found";

            let [start, end] = paginate(contentData, (load = "topics"));
            console.log(start, end);

            // Creating a content section
            let reqData = data.slice(start, end);
            console.log(reqData);
            document.getElementById("contentSection").innerHTML = "";
            let idx = currPageNo * pageSize;
            reqData.forEach((topicCollection) => {
                let contentDiv = document.createElement("div");
                contentDiv.classList.add(
                    "contentDiv",
                    "shadow",
                    "rounded",
                    "p-3",
                    "mb-5"
                );
                contentDiv.id = "contentDiv" + idx;

                let contentRow = document.createElement("div");
                contentRow.classList.add("row");
                let contentCol = document.createElement("div");
                contentCol.classList.add("col-12");
                contentRow.append(contentCol);

                let topicLink = document.createElement("a");

                topicLink.href =
                    "viewContent.html?topicId=" + topicCollection._id;
                topicLink.innerText = idx + 1 + "." + topicCollection.topic;
                contentCol.append(topicLink);
                contentDiv.append(contentRow);
                document.getElementById("contentSection").append(contentDiv);
                idx++;
            });
        });
}
