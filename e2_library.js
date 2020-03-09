/* E2 Library - JS */

/*-----------------------------------------------------------*/
/* Starter code - DO NOT edit the code below. */
/*-----------------------------------------------------------*/

// global counts
let numberOfBooks = 0; // total number of books
let numberOfPatrons = 0; // total number of patrons

// global arrays
const libraryBooks = [] // Array of books owned by the library (whether they are loaned or not)
const patrons = [] // Array of library patrons.

// Book 'class'
class Book {
	constructor(title, author, genre) {
		this.title = title;
		this.author = author;
		this.genre = genre;
		this.patron = null; // will be the patron objet

		// set book ID
		this.bookId = numberOfBooks;
		numberOfBooks++;
	}

	setLoanTime() {
		// Create a setTimeout that waits 3 seconds before indicating a book is overdue

		const self = this; // keep book in scope of anon function (why? the call-site for 'this' in the anon function is the DOM window)
		setTimeout(function() {
			
			console.log('overdue book!', self.title)
			changeToOverdue(self);

		}, 3000)

	}
}

// Patron constructor
const Patron = function(name) {
	this.name = name;
	this.cardNumber = numberOfPatrons;

	numberOfPatrons++;
}


// Adding these books does not change the DOM - we are simply setting up the 
// book and patron arrays as they appear initially in the DOM.
libraryBooks.push(new Book('Harry Potter', 'J.K. Rowling', 'Fantasy'));
libraryBooks.push(new Book('1984', 'G. Orwell', 'Dystopian Fiction'));
libraryBooks.push(new Book('A Brief History of Time', 'S. Hawking', 'Cosmology'));

patrons.push(new Patron('Jim John'))
patrons.push(new Patron('Kelly Jones'))

// Patron 0 loans book 0
libraryBooks[0].patron = patrons[0]
// Set the overdue timeout
libraryBooks[0].setLoanTime()  // check console to see a log after 3 seconds


/* Select all DOM form elements you'll need. */ 
const bookAddForm = document.querySelector('#bookAddForm');
const bookInfoForm = document.querySelector('#bookInfoForm');
const bookLoanForm = document.querySelector('#bookLoanForm');
const patronAddForm = document.querySelector('#patronAddForm');

/* bookTable element */
const bookTable = document.querySelector('#bookTable')
/* bookInfo element */
const bookInfo = document.querySelector('#bookInfo')
/* Full patrons entries element */
const patronEntries = document.querySelector('#patrons')

/* Event listeners for button submit and button click */

bookAddForm.addEventListener('submit', addNewBookToBookList);
bookLoanForm.addEventListener('submit', loanBookToPatron);
patronAddForm.addEventListener('submit', addNewPatron)
bookInfoForm.addEventListener('submit', getBookInfo);

/* Listen for click patron entries - will have to check if it is a return button in returnBookToLibrary */
patronEntries.addEventListener('click', returnBookToLibrary)

/*-----------------------------------------------------------*/
/* End of starter code - do *not* edit the code above. */
/*-----------------------------------------------------------*/


/** ADD your code to the functions below. DO NOT change the function signatures. **/


/*** Functions that don't edit DOM themselves, but can call DOM functions 
     Use the book and patron arrays appropriately in these functions.
 ***/

// Adds a new book to the global book list and calls addBookToLibraryTable()
function addNewBookToBookList(e) {
	e.preventDefault();

	// Add book book to global array
	const bkName = document.querySelector('#newBookName').value
	const bkAuthor = document.querySelector('#newBookAuthor').value
	const bkGenre = document.querySelector('#newBookGenre').value
	if(bkName=="" || bkAuthor=="" || bkGenre=="") {
		throw 'Must fill in all fields'
	} else {
		var newBook = new Book(bkName, bkAuthor, bkGenre)
		libraryBooks.push(newBook)
	}

	// SHOULD WE CHECK FOR DUPLICATE BOOK BEING ADDED

	// Call addBookToLibraryTable properly to add book to the DOM
	addBookToLibraryTable(newBook)

}

// Changes book patron information, and calls 
function loanBookToPatron(e) {
	e.preventDefault();

	// Get correct book and patron
	const loaningBookId = document.querySelector('#loanBookId').value
	const loaningToCard = document.querySelector('#loanCardNum').value

	if(loaningBookId=="" || loaningToCard==""){
		throw 'Must Fill In Both Fields'
	}

	var wantToLoanBook = null;
	wantToLoanBook = libraryBooks.find( ({ bookId }) => bookId == loaningBookId );
	if(wantToLoanBook == null) {
		throw 'Book does not exist in system'
	}

	var wantLoanToCard = null;
	wantLoanToCard = patrons.find( ({ cardNumber }) => cardNumber == loaningToCard );
	if(wantLoanToCard == null) {
		throw 'Patron does not exist in system'
	}

	// Add patron to the book's patron property
	if(wantToLoanBook.patron == null) {
		wantToLoanBook.patron = wantLoanToCard
	} else {
		throw 'This book is already loaned out'
	}

	// Add book to the patron's book table in the DOM by calling addBookToPatronLoans()
	addBookToPatronLoans(wantToLoanBook)

	// Start the book loan timer.
	wantToLoanBook.setLoanTime()

}

// Changes book patron information and calls returnBookToLibraryTable()
function returnBookToLibrary(e){
	e.preventDefault();
	// check if return button was clicked, otherwise do nothing.
	var bookToDelId = null
	if(e.target.classList.contains('return')) {
		bookToDelId = e.target.parentElement.parentElement.firstElementChild.innerText
	}

	// Call removeBookFromPatronTable()
	if(bookToDelId!=null) {
		const bookToRemove = e.target.parentElement.parentElement
		removeBookFromPatronTable(bookToRemove)
	}

	// Change the book object to have a patron of 'null'
	if(bookToDelId!=null) {
		var bookToDel = null
		bookToDel = libraryBooks.find( ({ bookId }) => bookId == bookToDelId );
		bookToDel.patron = null
		console.log('Book ' +bookToDel.title+' was returned successfully')
	}

}

// Creates and adds a new patron
function addNewPatron(e) {
	e.preventDefault();

	// Add a new patron to global array
	const newPatronName = document.querySelector('#newPatronName').value
	let newPatron = new Patron(newPatronName)
	patrons.push(newPatron)

	// Call addNewPatronEntry() to add patron to the DOM
	addNewPatronEntry(newPatron)

}

// Gets book info and then displays
function getBookInfo(e) {
	e.preventDefault();

	// Get correct book
	const bkID = document.querySelector('#bookInfoId').value
	var wantedBook;
	for(var i = 0; i<libraryBooks.length; i++){
		if(libraryBooks[i].bookId == bkID){
			wantedBook = libraryBooks[i]
			break;
		}
	}

	// Call displayBookInfo()
	displayBookInfo(wantedBook)

	console.log('successfully displayed info for book '+wantedBook.title)

}

/*-----------------------------------------------------------*/
/***					HELPER FUNCTIONS                   ***/
function changePatronForBook(bookid, patron) {
	const booktblbody = document.querySelector('#bookTable').firstElementChild
	const allRows = booktblbody.children
	var wantedCell = null
	for(var i=1;i<allRows.length;i++) {
		if(allRows[i].firstElementChild.innerText == bookid) {
			wantedCell = allRows[i].children[2]
			break
		}
	}
	console.log(wantedCell)
	wantedCell.innerText = patron
}

/*-----------------------------------------------------------*/
/*** DOM functions below - use these to create and edit DOM objects ***/

// Adds a book to the library table.
function addBookToLibraryTable(book) {
	// Add code here
	const bkId = book.bookId
	const bkName = book.title
	var bkLoanedPatron = null
	if(book.patron == null){
		bkLoanedPatron = ""
	} else {
		bkLoanedPatron = book.patron
	}

	const bookRow = document.createElement('tr')
	
	const bkIdLabel = document.createElement('td')
	const bkIdText = document.createTextNode(bkId)
	bkIdLabel.appendChild(bkIdText)
	bookRow.appendChild(bkIdLabel)

	const bkNameLabel = document.createElement('td')
	const nameStrong = document.createElement('strong')
	const bkNameText = document.createTextNode(bkName)
	nameStrong.appendChild(bkNameText)
	bkNameLabel.appendChild(nameStrong)
	bookRow.appendChild(bkNameLabel)

	const bkLoanedPatronLabel = document.createElement('td')
	const bkLoanedPatronText = document.createTextNode(bkLoanedPatron)
	bkLoanedPatronLabel.appendChild(bkLoanedPatronText)
	bookRow.appendChild(bkLoanedPatronLabel)

	bookTable.firstElementChild.appendChild(bookRow)

	document.querySelector('#newBookName').value=""
	document.querySelector('#newBookAuthor').value=""
	document.querySelector('#newBookGenre').value=""

	console.log('Added '+book.title+' successfully')

}


// Displays deatiled info on the book in the Book Info Section
function displayBookInfo(book) {
	// Add code here

	const bookInfoDiv = document.querySelector('#bookInfo')
	const infoParaTags = bookInfoDiv.getElementsByTagName('p')

	var loaned;
	if(book.patron==null){
		loaned = 'N/A'
	} else {
		loaned = book.patron.name
	}

	const bookInfo = [book.bookId, book.title, book.author, book.genre, loaned]

	for(var i = 0; i<infoParaTags.length; i++) {
		const spanElement = infoParaTags[i].getElementsByTagName('span')
		spanElement[0].innerText = bookInfo[i]
	}

	document.querySelector('#bookInfoId').value=""
}

// Adds a book to a patron's book list with a status of 'Within due date'. 
// (don't forget to add a 'return' button).
function addBookToPatronLoans(book) {
	// Add code here

	// FIND THE DIV OF THE RIGHT PATRON WHO WANTS TO LOAN THE BOOK AND ACCESS THEIR LOAN TABLE
	const allPatrons = document.querySelector('#patrons').children
	const wantedPatron = allPatrons[book.patron.cardNumber]

	const loansTblBody = wantedPatron.querySelector('.patronLoansTable').firstElementChild

	// CREATE AND ADD THE NEW LOAN ROW TO THE TABLE FOR THE PATRON
	const newLoanRow = document.createElement('tr')

	const bkIdLabel = document.createElement('td')
	const bkIdText = document.createTextNode(book.bookId)
	bkIdLabel.appendChild(bkIdText)
	newLoanRow.appendChild(bkIdLabel)

	const bkNameLabel = document.createElement('td')
	const nameStrong = document.createElement('strong')
	nameStrong.appendChild(document.createTextNode(book.title))
	bkNameLabel.appendChild(nameStrong)
	newLoanRow.appendChild(bkNameLabel)

	const bkStatusLabel = document.createElement('td')
	const statusSpan = document.createElement('span')
	statusSpan.className = 'green'
	statusSpan.appendChild(document.createTextNode('Within due date'))
	bkStatusLabel.appendChild(statusSpan)
	newLoanRow.appendChild(bkStatusLabel)

	const returnLabel = document.createElement('td')
	const returnBtn = document.createElement('button')
	returnBtn.className = 'return'
	returnBtn.appendChild(document.createTextNode('return'))
	returnLabel.appendChild(returnBtn)
	newLoanRow.appendChild(returnLabel)

	loansTblBody.appendChild(newLoanRow)

	changePatronForBook(book.bookId, book.patron.cardNumber)

	// CLEAR THE INPUT TEXT BOXES
	document.querySelector('#loanBookId').value = ""
	document.querySelector('#loanCardNum').value = ""

	console.log('loaned book '+book.title+' to '+book.patron.name+' successfully')

}

// Adds a new patron with no books in their table to the DOM, including name, card number,
// and blank book list (with only the <th> headers: BookID, Title, Status).
function addNewPatronEntry(patron) {
	// Add code here
	const allPatronsDiv = document.querySelector('#patrons')

	const newPatronDiv = document.createElement('div')
	newPatronDiv.className = 'patron'

	// MAKING THE TOP THREE TEXT ELEMENTS OF THE NEW PATRONS DIV
	const pName = document.createElement('p')
	pName.appendChild(document.createTextNode('Name: '))
	const nameSpan = document.createElement('span')
	nameSpan.className = 'bold'
	nameSpan.appendChild(document.createTextNode(patron.name))
	pName.appendChild(nameSpan)
	newPatronDiv.appendChild(pName)

	const pCnum = document.createElement('p')
	pCnum.appendChild(document.createTextNode('Card Number: '))
	const cnumSpan = document.createElement('span')
	cnumSpan.className = 'bold'
	cnumSpan.appendChild(document.createTextNode(patron.cardNumber))
	pCnum.appendChild(cnumSpan)
	newPatronDiv.appendChild(pCnum)

	const tableTitle = document.createElement('h4')
	tableTitle.appendChild(document.createTextNode('Books on loan:'))
	newPatronDiv.appendChild(tableTitle)

	// MAKING THE LOANS TABLE FOR THE PATRON
	const patronLoansTbl = document.createElement('table')
	patronLoansTbl.className = 'patronLoansTable'
	patronLoansTbl.appendChild(document.createElement('tbody'))

	const tblHeaderRow = document.createElement('tr')

	const idLabel = document.createElement('th')
	idLabel.appendChild(document.createTextNode('BookID'))
	tblHeaderRow.appendChild(idLabel)

	const titleLabel = document.createElement('th')
	titleLabel.appendChild(document.createTextNode('Title'))
	tblHeaderRow.appendChild(titleLabel)

	const statusLabel = document.createElement('th')
	statusLabel.appendChild(document.createTextNode('Status'))
	tblHeaderRow.appendChild(statusLabel)

	const returnLabel = document.createElement('th')
	returnLabel.appendChild(document.createTextNode('Return'))
	tblHeaderRow.appendChild(returnLabel)

	// ADD THE TABLE WE BUILT TO THE NEW PATRON'S DIV AND THAT DIV TO THE MAIN PARENT DIV
	patronLoansTbl.firstElementChild.appendChild(tblHeaderRow)
	newPatronDiv.appendChild(patronLoansTbl)
	allPatronsDiv.appendChild(newPatronDiv)

	// CLEAR THE INPUT TEXT BOX
	document.querySelector('#newPatronName').value=""

	console.log('created new patron div successfully')
}


// Removes book from patron's book table and remove patron card number from library book table
function removeBookFromPatronTable(book) {
	// Add code here
	const loansTbl = book.parentElement
	loansTbl.removeChild(book)
	// const patron = loansTbl.parentElement.parentElement.children[1].firstElementChild.innerText
	// console.log(patron)
	changePatronForBook(book.firstElementChild.innerText, "")

}

// Set status to red 'Overdue' in the book's patron's book table.
function changeToOverdue(book) {
	// Add code here
	const allPatronTables = document.querySelector('#patrons').children

	var patronDiv = null
	for(var i=0;i<allPatronTables.length;i++) {
		if(allPatronTables[i].children[1].firstElementChild.innerText == book.patron.cardNumber) {
			patronDiv = allPatronTables[i]
			break
		}
	}
	
	const loansTable = patronDiv.children[3].firstElementChild
	const loansRows = loansTable.children

	var cellToChange = null
	for(var j=1;j<loansRows.length;j++) {
		if(loansRows[j].firstElementChild.innerText == book.bookId) {
			cellToChange = loansRows[j].children[2].firstElementChild
			break
		}
	}

	cellToChange.className = 'red'
	cellToChange.innerText = 'Overdue'

	console.log('Changed '+book.title+' to overdue for patron '+book.patron.name)

}

