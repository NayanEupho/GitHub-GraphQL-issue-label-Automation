import { load } from "https://deno.land/std@0.221.0/dotenv/mod.ts";
const env = await load();
const REPO = "GraphQL_Practice";
const USER = "NayanEupho";
const GitHub_TOKEN = env["GITHUB_TOKEN"];
const URL = "https://api.github.com/graphql";

console.log(GitHub_TOKEN);

async function Run_GraphQL_query (oper) {
    try {
        let response = await fetch(URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${GitHub_TOKEN}`,
            },
            body: JSON.stringify({ query: oper }),
        });
        
        return await response.json();

    } catch (error) {
        console.error(`\nError occured while executing the GraphQL Query: ${error}\n`);
    }
}


async function getRepo_ID() {
    try {
        let query = `
            query {
                repository(owner:"${USER}", name:"${REPO}") {
                    id
                }
            }
        `;

        let json = await Run_GraphQL_query(query);

        let repo_ID = json.data.repository.id;

        console.log(`\nRepo ID: ${repo_ID}\n`);

        return repo_ID;

    } catch (error) {
        console.error(`\nError while fetching Repo ID: ${error}\n`);
    }
}

async function Create_Issue(title, body) {
    try {
        let repoId = await getRepo_ID();

        // Mutation for creating the Issue
        let mutant = `
            mutation {
                createIssue(input:{repositoryId:"${repoId}", title:"${title}", body:"${body}"}) {
                    issue {
                        id
                        title
                        body
                    }
                }
            }
        `;

        // Running the Mutation
        let json = await Run_GraphQL_query(mutant);
        console.log(`\n${JSON.stringify(json)}\n`);

        return json.data.createIssue.issue.id;

    } catch (error) {
        console.error(`\nError while creating a Issue: ${error}\n`);
    }
}

async function get_open_issue(){
    // this will return an array of objects that with Issue ID & Issue Title and will conatains all the open issues
    try{
        let query = `
            query {
                repository(owner:"${USER}", name:"${REPO}") {
                    issues(states: OPEN, first: 100) {
                        nodes {
                            id
                            title
                        }
                    }
                }
            }
        `;

        let json = await Run_GraphQL_query(query);
        let openIssues = json.data.repository.issues.nodes;

        return openIssues.map(issue => ({
            id: issue.id,
            title: issue.title
        }));
    }
    catch{
        console.error(`\nError while fetching open issues: ${error}\n`);
        return [];
    }
}


async function delete_Issue(issue_Id) {
    try {
        // Mutation for Deleting the Issue
        let mutant = `
            mutation {
                deleteIssue(input:{issueId:"${issue_Id}"}) {
                    clientMutationId
                }
            }
        `;
        // Running the Mutation
        let json = await Run_GraphQL_query(mutant);
        console.log(`\n${JSON.stringify(json)}\n`);

        return null;

    } catch (error) {
        console.error(`\nError while deleting the Issue: ${error}\n`);
    }
}


async function create_get_Label_ID(lable_type) {
    try {
        let query = `
            query {
                repository(owner:"${USER}", name:"${REPO}") {
                    label(name:"${lable_type}") {
                        id
                    }
                }
            }
        `;

        let json = await Run_GraphQL_query(query);
        console.log(`\n${JSON.stringify(json)}\n`);

        let label_ID = json.data.repository.label.id;
        console.log(`Label ID: ${label_ID}`);

        return label_ID;

    } catch (error) {
        console.error(`\nError while fetching Label_Id: ${error}\n`);
    }
}


async function add_Label_To_Issue(issue_Id, label_Id) {
    try {
        let mutation = `
            mutation {
                addLabelsToLabelable(input:{labelableId:"${issue_Id}", labelIds:["${label_Id}"]}) {
                    clientMutationId
                }
            }
        `;
        // Run the Mutation
        let json = await Run_GraphQL_query(mutation);   
        console.log(`\n${JSON.stringify(json)}\n`);

        return null;

    } catch (error) {
        console.error(`\nError while adding lable to issue: ${error}\n`);
    }
}

let Issue_ID_1 = await Create_Issue("1st Issue using GQL & GitHub API", "Created a new issue using the GraphQL & GitHub API");
await add_Label_To_Issue(Issue_ID_1, await create_get_Label_ID("bug"));

let Issue_ID_2 = await Create_Issue("2nd Issue using GQL & GitHub API", "Created a new issue using the GraphQL & GitHub API");
await add_Label_To_Issue(Issue_ID_2, await create_get_Label_ID("bug"));

let Issue_ID_3 = await Create_Issue("3rd Issue using GQL & GitHub API", "Created a new issue using the GraphQL & GitHub API");
await add_Label_To_Issue(Issue_ID_3, await create_get_Label_ID("bug"));

// await delete_Issue(Issue_ID_2);

let Open_Issues_map = await get_open_issue();
console.log(Open_Issues_map);
delete_Issue(Open_Issues_map[0].id);
