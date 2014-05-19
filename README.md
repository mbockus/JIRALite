# JIRALite

JIRALite is a tool used to easily log work against JIRA issues.   

## Getting Started

Some things to know before you start using the tool:

* The tool currently interacts with the JIRA server using a proxy.  I went this route because the tool has no backend to issue the requests to the JIRA server and CORS is not currently supported.
* To configure access to the server, you have to pass the cookie that's used by the JIRA server to retain access between sessions. You can grab that cookie from the browser after logging into JIRA and enabling the option at login to 'Remember my login on this computer'.
* Since a proxy is used and that proxy is configured with a specific user's cookie to provide access, the tool should not be used in a multi-user environment. 

Please fork if you have some ideas on how to implement support for CORS or a way to authorize the client without the use of a cookie.
   
## Documentation

To start the server, execute the following command:

    grunt serve --jiraServer=<jira_server> --authCookie=<cookie_for_retaining_access> 



