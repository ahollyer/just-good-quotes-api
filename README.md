# Just Good Quotes
## A simple API serving up only good quotes, as judged by yours truly.

### [Aspen Hollyer](http://www.aspenhollyer.com)'s submission to [DigitalCrafts](http://www.DigitalCrafts.com)' individual project week.
------

### Summary

Several APIs exist to serve up random or daily quotes. Most either cost money, cannot be filtered easily, or simply contain too many bad quotes that no one wants to read.

This project aims simply to supply folks in need with good quotes that provide some sort of insight or humor. No more stupid 1980's movie quotes or cliches misattributed to Einstein.

Hopefully, this project meets your needs if your needs are for tasty, bite-sized bits of inspiration. Enjoy!

-----

### MVP (Minimum Viable Product)

- [x] Users can retrieve a random quote from the API. **Done! 7/13**
- [x] Users can retrieve quotes by author and category. **Done! 718**
- [ ] The database contains at least 200 quality quotes from a variety of sources.

-----

### Stretch Goals
- [ ] The database contains 500 quality quotes from a variety of sources.
- [x] Easily submit a form to add new quotes/authors/categories to the database. **Done! 7/13**
- [ ] Users can install from npm (API helper)
- [ ] Users can install from npm (data)
- [ ] Users can install as a Python package
- [x] Users can login through a front-end to request/manage API keys. **Done! 7/18**
- [ ] Users can submit quote suggestions through a form on the website.
- [x] Users can view random quotes on the website. **Done! 7/15**
- [ ] Users can search for quotes on the website.
- [ ] Uses semantic search with Watson API.
- [ ] Users can filter quotes on the website by author and category.
- [ ] Users can click buttons to share quotes on social media from the website.
- [ ] Users can npm install a separate package just for Tolkien quotes--because Lord of The Rings rocks.
- [ ] Set up caching linked to api keys

-----
## Developer's Journal
### Individual Project Week: July 13-20

Day 1, I decided on a project, then brainstormed the MVP and stretch goals. I was able to build out a *really* basic working project that accepts a user request, pulls a random quote from the database, and sends it as a JSON response. From there, I gradually continued adding features.

#### I learned . . .
It was important to me to use a SQL database for this project, because I really want to work on SQL basics. I've gotten a lot better at organizing data and retrieving the information I want. For example, here is how we construct the query when the user sends an API request for random quotes:

```javascript
let query = `SELECT a.name AS author,
                    qc.quote_id AS id,
                    q.text,
                    c.name AS category
             FROM quotecategory qc
             JOIN quote q ON qc.quote_id = q.id
             JOIN author a ON q.author_id = a.id
             JOIN category c ON qc.category_id = c.id `;

if(params.random) {
  query += `WHERE qc.quote_id
            IN (SELECT id FROM quote
            ORDER BY RANDOM()
            LIMIT ${params.numQuotes});`;
}
```

I also made an HTML form to add new quotes to the database more easily.  Writing the queries and insert statements for the database update form was good practice. It was difficult figuring out how to chain promises together in order to update the database with the form data, but I am so glad I get to work with promises instead of the old nested callbacks.

For the 'Add Quote' database update form, each quote needs an author_id, a foreign key reference to the author table. So if the user specifies a new author on the form, we need to execute the insert statement for the author table, wait for that promise to return, then move forward with executing the insert statement for the quote, so that the foreign key it needs to refer to exists. However, if the user specifies an author who already exists in the database, that first promise is unnecessary and should be skipped. A similar problem occurs when the user adds a new category tag for the quote, as opposed to a category which already exists in the database. I learned a lot about promises, and I'm curious about refactoring this with the new async/await at some point. Right now I'm using the [bluebird](https://www.npmjs.com/package/bluebird) library for promises.

### Progress Update: Thursday, July 13
- [x] get at least 100 quotes into the database
- [x] accept author and category parameters in the API request
- [x] deploy the app
- [x] deploy the database

#### I learned . . .
how to split code into modules in Node. It was pretty easy. I want to work on making my code more modular and organized. I'm definitely still at a stage where it's hard to think about a complex app at a high level and organize the code into meaningful, self-contained sections. But I see the value in modular programming and want to continue reading, practicing, and getting better at it.

### Progress Update: Monday, July 24
Well, project week is over. I was able to give a 3-minute demo of my app, and everything worked (phew!). Now, I'm working on getting e-mail verification for accounts all set up through Amazon SES. Still waiting to get out of the sandbox, but the code works. I'm using a package called [nodemailer](https://www.npmjs.com/package/nodemailer), and WOW, it's so much easier than it was setting up e-mail in Django. Then again, I guess everything is easier the second time around.

I'm continuing to plow through the Stretch Goals in no particular order. The app will soon be ready for the wider world to use. If you'd like to help test this very early version, check out http://quotes.aspenhollyer.com

Thanks, and feel free to e-mail me with questions!
Aspen
aspen.hollyer@gmail.com
