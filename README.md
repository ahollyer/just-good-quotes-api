# Just Good Quotes
## A simple API serving up only good quotes, as judged by yours truly.

### [Aspen Hollyer](http://www.aspenhollyer.com)'s submission to [DigitalCrafts](http://www.DigitalCrafts.com)' individual project week.
------

### Summary

Several APIs exist to serve up random or daily quotes. Most either cost money, cannot be filtered by category, or simply contain too many bad quotes that no one wants to read.

This project aims simply to supply folks in need with good quotes that provide some sort of insight or humor. No more stupid 1980's movie quotes or cliches misattributed to Einstein.

Hopefully, this project meets your needs if your needs are for tasty, bite-sized bits of inspiration. Enjoy!

-----

### MVP (Minimum Viable Product)

- [x] Users can retrieve a random quote from the API. **Done! 7/13**
- [ ] Users can retrieve quotes by author and/or category.
- [ ] The database contains at least 200 quality quotes from a variety of sources.

-----

### Stretch Goals
- [ ] The database contains 500 quality quotes from a variety of sources.
- [x] Easily submit a form to add new quotes/authors/categories to the database. **Done! 7/13**
- [ ] Users can install from npm (API helper)
- [ ] Users can install from npm (data)
- [ ] Users can install as a Python package
- [ ] Users can login through a front-end to request/manage API keys.
- [ ] Users can submit quote suggestions through a form on the website.
- [ ] Users can view random quotes on the website.
- [ ] Users can search for quotes on the website.
- [ ] Add semantic search with Watson API.
- [ ] Users can filter quotes on the website by author and category.
- [ ] Users can click buttons to share quotes on social media from the website.
- [ ] Users can npm install a separate package just for Tolkien quotes--because Lord of The Rings rocks.

-----

## Individual Project Week: July 13-20

### Thursday, July 13
Today, I decided on a project, then brainstormed the MVP and stretch goals. I was able to build out a *really* basic working project that accepts a user request, pulls a random quote from the database, and sends it as a JSON response.

#### I learned . . .
The form to update the database took several hours, but I learned a lot. It was important to me to use a SQL database for this project, because I really want to work on mastering SQL basics. Writing the queries and insert statements for the form was good practice. An example:

```javascript
const newQuoteCatInsert = `INSERT INTO \
quotecategory (quote_id, category_id) \
VALUES (${quoteId[0].id}, ${catId[0].id})`;
```

It was difficult figuring out how to chain promises together in order to update the database with the form data. For example, each quote needs an author_id, a foreign key reference to the author table. So if the user specifies a new author on the form, we need to execute the insert statement for the author table, wait for that promise to return, then move forward with executing the insert statement for the quote, so that the foreign key it needs to refer to exists. However, if the user specifies an author who already exists in the database, that first promise is unnecessary and should be skipped. A similar problem occurs when the user adds a new category tag for the quote, as opposed to a category which already exists in the database. I learned a lot about promises, and I'm curious about refactoring this with the new async/await at some point.

#### Goals for Tomorrow
- get at least 100 quotes into the database
- accept author and category parameters in the API request
- deploy the database
- deploy the server

--------

### Thursday, July 13


#### Goals from Yesterday
- [x] get at least 100 quotes into the database
- [ ] accept author and category parameters in the API request
- [ ] deploy the database
- [ ] deploy the server

#### I learned . . .
how to split code into modules in Node. It was pretty easy. I want to work on making my code more modular and organized. I'm definitely still at a stage where it's hard to think about a complex app at a high level and organize the code into meaningful, self-contained sections. But I see the value in modular programming and want to continue reading, practicing, and getting better at it.

#### Goals for Tomorrow
