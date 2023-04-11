const bookmarksList = document.getElementById('bookmarks-list');
let inputToCreateAFolder = document.getElementById('input_to_create_a_folder');
chrome.bookmarks.getTree(async (bookmarkTreeNodes) => {
  for (const node of bookmarkTreeNodes) {
    if (node.children) {
      await addBookmarks(node.children, bookmarksList);
    }
    else {
      bookmarksList.appendChild(createListItem(node.title, node.url, node.id));
    }
  }
});

// Recursively add bookmarks to the parent element
async function addBookmarks(bookmarkNodes, parent) {
  for (const node of bookmarkNodes) {
    if (node.children) {
      // If the node is a folder, create a new details element for it
      const details = document.createElement('details');
      details.classList.add('bookmark-item');
      // force open the details (folder)
      details.setAttribute('open', 'true');
      // #############################################
      const summary = document.createElement('summary');
      const image = document.createElement('img');
      const pTag = document.createElement('p');
      summary.classList.add('bookmark-link');
      summary.appendChild(image);
      pTag.innerText = node.title;
      summary.appendChild(pTag);
      pTag.classList.add('detailspTag');
      image.src = "icon/open-folder.png";
      image.alt = "image";
      image.classList.add('no-image');
      details.appendChild(summary);

      // Create a new ul element to store the bookmarks inside the folder
      const ul = document.createElement('ul');
      await addBookmarks(node.children, ul);

      // Append the ul element to the details element
      details.appendChild(ul);
    // add image to details folder 
    
      // Append the details element to the parent element

      parent.appendChild(details);
      
    } else {
      // If the node is a bookmark, create a new li element for it
      parent.appendChild(createListItem(node.title, node.url, node.id));
    }
  }
}

function createListItem(title, url, id) {
  // if it's folder make it a details make the bookmark inside the details


  const li = document.createElement('li');
  li.classList.add('bookmark-item');
  const a = `<a href="${url ? url : "#"}" class="bookmark-link">${title}</a>`;
  const buttonDelete = `<button id="delete" value="${id}">delete</button>`;
  const buttonEdit = `<button id="edit" value="${id}">edit</button>`;
  const image = `<img src="${url ? "https://s2.googleusercontent.com/s2/favicons?domain=" + url : "icon/open-folder.png"} " alt="image" class="no-image">`;
  li.innerHTML = `${image}${a}${buttonEdit}${buttonDelete}`;
  li.querySelector('#delete').addEventListener('click', deleteBookMark);
  li.querySelector('#edit').addEventListener('click', createElement);
  return li;
}

// get current tab 
function getCurrentTab() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        resolve(tabs[0]);
      } else {
        reject('No active tabs found in the last focused window.');
      }
    });
  });
}
async function getCurrentTabIndex() {
  try {
    const value = await getCurrentTab();
    const tabIndex = value.index;
    return tabIndex;
  } catch (error) {
    console.log(error)
  }
}
async function getCurrentTabUrl() {
  try {
    const value = await getCurrentTab();
    const tabUrl = value.url;
    return tabUrl;
  } catch (error) {
    console.log(error)
  }
}

async function getCurrentTabTitle() {
  try {
    const value = await getCurrentTab();
    const tabTitle = value.title
    return tabTitle

  } catch (error) {
    console.log(error)
  }
}
//Todo to override the extension page :

//! create onclick function to create a folder when user click
document.getElementById('create_new_bookmark').addEventListener('click', createNewBookMark)
async function createNewBookMark() {
  chrome.bookmarks.getTree(async function (bookmarkTreeNodes) {
    let bookmarkBar = bookmarkTreeNodes[0].children[0].id;

    try {
      let tabTitle = await getCurrentTabTitle();
      let tabUrl = await getCurrentTabUrl();
      chrome.bookmarks.create({
        'parentId': bookmarkBar,
        'title': tabTitle,
        'url': tabUrl
      }, function (newBookmark) {
        console.log("Added bookmark: " + newBookmark.title);
      });
    } catch (error) {
      console.log(error);
    }
  });
}
document.getElementById('create_new_folder').addEventListener('click', createNewFolder)
async function createNewFolder() {
  chrome.bookmarks.getTree(async function (bookmarkTreeNodes) {
    let bookmarkBar = bookmarkTreeNodes[0].children[0].id;
    chrome.bookmarks.create({
      'parentId': bookmarkBar,
      'title': inputToCreateAFolder.value
    }, function (newFolder) {
      console.log("Added folder: " + newFolder.title);
    });
  })
}
// delete bookmark 
function deleteBookMark() {
  let bookmarkId = String(this.value);
  chrome.bookmarks.remove(bookmarkId)
}

//TODO update changes (user change's (url , title))

function createElement(event) {
  const id = event.target.value;
  const listItem = event.target.closest('li');
  const link = listItem.querySelector('.bookmark-link');
  const title = link.innerText;
  const url = link.href;
  // Create input fields for editing the bookmark title and URL
  const titleInput = document.createElement('input');
  titleInput.type = 'text';
  titleInput.placeholder = 'Title';
  titleInput.value = title;

  const urlInput = document.createElement('input');
  urlInput.type = 'text';
  urlInput.placeholder = 'URL';
  urlInput.value = url;

  // Create a submit button for saving the changes
  const saveButton = document.createElement('button');
  saveButton.innerText = 'Save';
  saveButton.addEventListener('click', async () => {
    const newTitle = titleInput.value;
    const newUrl = urlInput.value;

    // Update the bookmark with the new title and URL
    const updatedBookmark = await chrome.bookmarks.update(id, { title: newTitle, url: newUrl });

    // Update the link text and href in the list item
    link.innerText = updatedBookmark.title;
    link.href = updatedBookmark.url;

    // Remove the input fields and submit button
    listItem.removeChild(titleInput);
    listItem.removeChild(urlInput);
    listItem.removeChild(saveButton);
  });

  // Append the input fields and submit button to the list item
  listItem.appendChild(titleInput);
  listItem.appendChild(urlInput);
  listItem.appendChild(saveButton);
}

// get user input
function getUserInput() {
  let userInput = document.getElementById('input_to_create_a_folder').value;
  return userInput
}
// edit bookmark
// TODO make it work
// suucessfull edit bookmark
function susscefullEditBookMark(bookMarkOrFolder) {
  console.log(bookMarkOrFolder.title)
}
// rejected edit bookmark
function rejectedEditBookMark() {
  console.log(`ERROR: ${this} unable to edit bookmark or folder`)
}
// edit bookmark function
function updateBookmarkOrFolder(id) {
  let userInput = getUserInput();
  let bookmarkId = String(this.value);
  chrome.bookmarks.update(bookmarkId, { title: userInput }, susscefullEditBookMark, rejectedEditBookMark)
}