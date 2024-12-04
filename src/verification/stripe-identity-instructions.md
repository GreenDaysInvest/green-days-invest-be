Verification Session 
A VerificationSession guides you through the process of collecting and verifying the identities of your users. It contains details about the type of verification, such as what verification check to perform. Only create one VerificationSession for each verification in your system.

A VerificationSession transitions through multiple statuses throughout its lifetime as it progresses through the verification flow. The VerificationSession contains the user’s verified data after verification checks are complete.

Related guide: The Verification Sessions API

Was this section helpful?
Yes
No
Endpoints
POST
/v1/identity/verification_sessions
POST
/v1/identity/verification_sessions/:id
GET
/v1/identity/verification_sessions/:id
GET
/v1/identity/verification_sessions
POST
/v1/identity/verification_sessions/:id/cancel
POST
/v1/identity/verification_sessions/:id/redact
The VerificationSession object 
Attributes

id
string
Unique identifier for the object.


object
string
String representing the object’s type. Objects of the same type share the same value.


client_reference_id
nullable string
A string to reference this user. This can be a customer ID, a session ID, or similar, and can be used to reconcile this verification with your internal systems.


client_secret
nullable string
The short-lived client secret used by Stripe.js to show a verification modal inside your app. This client secret expires after 24 hours and can only be used once. Don’t store it, log it, embed it in a URL, or expose it to anyone other than the user. Make sure that you have TLS enabled on any page that includes the client secret. Refer to our docs on passing the client secret to the frontend to learn more.


created
timestamp
Time at which the object was created. Measured in seconds since the Unix epoch.


last_error
nullable object
If present, this property tells you the last error encountered when processing the verification.

Show child attributes

last_verification_report
nullable string
Expandable
ID of the most recent VerificationReport. Learn more about accessing detailed verification results.


livemode
boolean
Has the value true if the object exists in live mode or the value false if the object exists in test mode.


metadata
object
Set of key-value pairs that you can attach to an object. This can be useful for storing additional information about the object in a structured format.


options
nullable object
A set of options for the session’s verification checks.

Show child attributes

provided_details
nullable object
Expandable
Details provided about the user being verified. These details may be shown to the user.

Show child attributes

redaction
nullable object
Redaction status of this VerificationSession. If the VerificationSession is not redacted, this field will be null.

Show child attributes

related_customer
nullable string
Token referencing a Customer resource.


status
enum
Status of this VerificationSession. Learn more about the lifecycle of sessions.

Possible enum values
canceled
The VerificationSession has been invalidated for future submission attempts.

processing
The session has been submitted and is being processed. Most verification checks are processed in less than 1 minute.

requires_input
Requires user input before processing can continue.

verified
Processing of all the verification checks are complete and successfully verified.


type
enum
The type of verification check to be performed.

Possible enum values
document
Document check.

id_number
ID number check.

verification_flow
Configuration provided by verification flow


url
nullable string
The short-lived URL that you use to redirect a user to Stripe to submit their identity information. This URL expires after 48 hours and can only be used once. Don’t store it, log it, send it in emails or expose it to anyone other than the user. Refer to our docs on verifying identity documents to learn how to redirect users to Stripe.


verification_flow
nullable string
The configuration token of a verification flow from the dashboard.


verified_outputs
nullable object
Expandable
The user’s verified data.

Show child attributes
The VerificationSession object
{
  "id": "vs_1NuNAILkdIwHu7ixh7OtGMLw",
  "object": "identity.verification_session",
  "client_secret": "...",
  "created": 1695680526,
  "last_error": null,
  "last_verification_report": null,
  "livemode": false,
  "metadata": {},
  "options": {
    "document": {
      "require_matching_selfie": true
    }
  },
  "redaction": null,
  "status": "requires_input",
  "type": "document",
  "url": "..."
}
Create a VerificationSession 
Creates a VerificationSession object.

After the VerificationSession is created, display a verification modal using the session client_secret or send your users to the session’s url.

If your API key is in test mode, verification checks won’t actually process, though everything else will occur as if in live mode.

Related guide: Verify your users’ identity documents

Parameters

client_reference_id
string
A string to reference this user. This can be a customer ID, a session ID, or similar, and can be used to reconcile this verification with your internal systems.


metadata
object
Set of key-value pairs that you can attach to an object. This can be useful for storing additional information about the object in a structured format. Individual keys can be unset by posting an empty value to them. All keys can be unset by posting an empty value to metadata.


options
object
A set of options for the session’s verification checks.

Show child parameters

provided_details
object
Details provided about the user being verified. These details may be shown to the user.

Show child parameters

related_customer
string
Token referencing a Customer resource.


return_url
string
The URL that the user will be redirected to upon completing the verification flow.


type
enum
The type of verification check to be performed. You must provide a type if not passing verification_flow.

Possible enum values
document
Document check.

id_number
ID number check.


verification_flow
string
The ID of a verification flow from the Dashboard. See https://docs.stripe.com/identity/verification-flows.

Returns
Returns the created VerificationSession object

POST 
/v1/identity/verification_sessions
Server-side language

cURL
curl https://api.stripe.com/v1/identity/verification_sessions \
  -u "sk_test_51Pye17HW5xgT0Q1XqWIoeoMbEn3OynAqYHNw6k5ty148s2o4oyveeoP3mJhXuBh6UMIbGPudEaUmemCTfjZ7XQ8600IqV97Fcf:" \
  -d type=document
Response
{
  "id": "vs_1NuN4zLkdIwHu7ixleE6HvkI",
  "object": "identity.verification_session",
  "client_secret": "...",
  "created": 1695680197,
  "last_error": null,
  "last_verification_report": null,
  "livemode": false,
  "metadata": {},
  "options": {},
  "redaction": null,
  "status": "requires_input",
  "type": "document",
  "url": "..."
}
Update a VerificationSession 
Updates a VerificationSession object.

When the session status is requires_input, you can use this method to update the verification check and options.

Parameters

metadata
object
Set of key-value pairs that you can attach to an object. This can be useful for storing additional information about the object in a structured format. Individual keys can be unset by posting an empty value to them. All keys can be unset by posting an empty value to metadata.


options
object
A set of options for the session’s verification checks.

Show child parameters

provided_details
object
Details provided about the user being verified. These details may be shown to the user.

Show child parameters

type
enum
The type of verification check to be performed.

Possible enum values
document
Document check.

id_number
ID number check.

Returns
Returns the updated VerificationSession object

POST 
/v1/identity/verification_sessions/:id
Server-side language

cURL
curl https://api.stripe.com/v1/identity/verification_sessions/vs_1NuN9WLkdIwHu7ix597AR9uz \
  -u "sk_test_51Pye17HW5xgT0Q1XqWIoeoMbEn3OynAqYHNw6k5ty148s2o4oyveeoP3mJhXuBh6UMIbGPudEaUmemCTfjZ7XQ8600IqV97Fcf:" \
  -d type=id_number
Response
{
  "id": "vs_1NuN9WLkdIwHu7ix597AR9uz",
  "object": "identity.verification_session",
  "client_secret": "...",
  "created": 1695680478,
  "last_error": null,
  "last_verification_report": null,
  "livemode": false,
  "metadata": {},
  "options": {},
  "redaction": null,
  "status": "requires_input",
  "type": "id_number",
  "url": "..."
}
Retrieve a VerificationSession 
Retrieves the details of a VerificationSession that was previously created.

When the session status is requires_input, you can use this method to retrieve a valid client_secret or url to allow re-submission.

Parameters
No parameters.

Returns
Returns a VerificationSession object

GET 
/v1/identity/verification_sessions/:id
Server-side language

cURL
curl https://api.stripe.com/v1/identity/verification_sessions/vs_1NuNAILkdIwHu7ixh7OtGMLw \
  -u "sk_test_51Pye17HW5xgT0Q1XqWIoeoMbEn3OynAqYHNw6k5ty148s2o4oyveeoP3mJhXuBh6UMIbGPudEaUmemCTfjZ7XQ8600IqV97Fcf:"
Response
{
  "id": "vs_1NuNAILkdIwHu7ixh7OtGMLw",
  "object": "identity.verification_session",
  "client_secret": "...",
  "created": 1695680526,
  "last_error": null,
  "last_verification_report": null,
  "livemode": false,
  "metadata": {},
  "options": {
    "document": {
      "require_matching_selfie": true
    }
  },
  "redaction": null,
  "status": "requires_input",
  "type": "document",
  "url": "..."
}
List VerificationSessions 
Returns a list of VerificationSessions

Parameters

client_reference_id
string
A string to reference this user. This can be a customer ID, a session ID, or similar, and can be used to reconcile this verification with your internal systems.


created
object
Only return VerificationSessions that were created during the given date interval.

Show child parameters

status
enum
Only return VerificationSessions with this status. Learn more about the lifecycle of sessions.

Possible enum values
canceled
The VerificationSession has been invalidated for future submission attempts.

processing
The session has been submitted and is being processed. Most verification checks are processed in less than 1 minute.

requires_input
Requires user input before processing can continue.

verified
Processing of all the verification checks are complete and successfully verified.

More parameters
Expand all

ending_before
string

limit
integer

starting_after
string
Returns
List of VerificationSession objects that match the provided filter criteria.

GET 
/v1/identity/verification_sessions
Server-side language

cURL
curl -G https://api.stripe.com/v1/identity/verification_sessions \
  -u "sk_test_51Pye17HW5xgT0Q1XqWIoeoMbEn3OynAqYHNw6k5ty148s2o4oyveeoP3mJhXuBh6UMIbGPudEaUmemCTfjZ7XQ8600IqV97Fcf:" \
  -d limit=3
Response
{
  "object": "list",
  "url": "/v1/identity/verification_sessions",
  "has_more": false,
  "data": [
    {
      "id": "vs_1NuNAILkdIwHu7ixh7OtGMLw",
      "object": "identity.verification_session",
      "client_secret": "...",
      "created": 1695680526,
      "last_error": null,
      "last_verification_report": null,
      "livemode": false,
      "metadata": {},
      "options": {
        "document": {
          "require_matching_selfie": true
        }
      },
      "redaction": null,
      "status": "requires_input",
      "type": "document",
      "url": "..."
    }
  ]
}
Cancel a VerificationSession 
A VerificationSession object can be canceled when it is in requires_input status.

Once canceled, future submission attempts are disabled. This cannot be undone. Learn more.

Parameters
No parameters.

Returns
Returns the canceled VerificationSession object

POST 
/v1/identity/verification_sessions/:id/cancel
Server-side language

cURL
curl -X POST https://api.stripe.com/v1/identity/verification_sessions/vs_1NuN3kLkdIwHu7ixk5OvTq3b/cancel \
  -u "sk_test_51Pye17HW5xgT0Q1XqWIoeoMbEn3OynAqYHNw6k5ty148s2o4oyveeoP3mJhXuBh6UMIbGPudEaUmemCTfjZ7XQ8600IqV97Fcf:"
Response
{
  "id": "vs_1NuN3kLkdIwHu7ixk5OvTq3b",
  "object": "identity.verification_session",
  "client_secret": null,
  "created": 1695680120,
  "last_error": null,
  "last_verification_report": null,
  "livemode": false,
  "metadata": {},
  "options": {
    "document": {
      "require_matching_selfie": true
    }
  },
  "redaction": null,
  "status": "canceled",
  "type": "document",
  "url": null
}
Redact a VerificationSession 
Redact a VerificationSession to remove all collected information from Stripe. This will redact the VerificationSession and all objects related to it, including VerificationReports, Events, request logs, etc.

A VerificationSession object can be redacted when it is in requires_input or verified status. Redacting a VerificationSession in requires_action state will automatically cancel it.

The redaction process may take up to four days. When the redaction process is in progress, the VerificationSession’s redaction.status field will be set to processing; when the process is finished, it will change to redacted and an identity.verification_session.redacted event will be emitted.

Redaction is irreversible. Redacted objects are still accessible in the Stripe API, but all the fields that contain personal data will be replaced by the string [redacted] or a similar placeholder. The metadata field will also be erased. Redacted objects cannot be updated or used for any purpose.

Learn more.

Parameters
No parameters.

Returns
Returns the redacted VerificationSession object

POST 
/v1/identity/verification_sessions/:id/redact
Server-side language

cURL
curl -X POST https://api.stripe.com/v1/identity/verification_sessions/vs_1NuN3kLkdIwHu7ixk5OvTq3b/redact \
  -u "sk_test_51Pye17HW5xgT0Q1XqWIoeoMbEn3OynAqYHNw6k5ty148s2o4oyveeoP3mJhXuBh6UMIbGPudEaUmemCTfjZ7XQ8600IqV97Fcf:"
Response
{
  "id": "vs_1NuN3kLkdIwHu7ixk5OvTq3b",
  "object": "identity.verification_session",
  "client_secret": null,
  "created": 1695680120,
  "last_error": null,
  "last_verification_report": null,
  "livemode": false,
  "metadata": {},
  "options": {
    "document": {
      "require_matching_selfie": true
    }
  },
  "redaction": {
    "status": "processing"
  },
  "status": "canceled",
  "type": "document",
  "url": null
}
Verification Report 
A VerificationReport is the result of an attempt to collect and verify data from a user. The collection of verification checks performed is determined from the type and options parameters used. You can find the result of each verification check performed in the appropriate sub-resource: document, id_number, selfie.

Each VerificationReport contains a copy of any data collected by the user as well as reference IDs which can be used to access collected images through the FileUpload API. To configure and create VerificationReports, use the VerificationSession API.

Related guide: Accessing verification results.

Was this section helpful?
Yes
No
Endpoints
GET
/v1/identity/verification_reports/:id
GET
/v1/identity/verification_reports
The VerificationReport object 
Attributes

id
string
Unique identifier for the object.


object
string
String representing the object’s type. Objects of the same type share the same value.


client_reference_id
nullable string
A string to reference this user. This can be a customer ID, a session ID, or similar, and can be used to reconcile this verification with your internal systems.


created
timestamp
Time at which the object was created. Measured in seconds since the Unix epoch.


document
nullable object
Result of the document check for this report.

Show child attributes

email
nullable object
Result of the email check for this report.

Show child attributes

id_number
nullable object
Result of the id number check for this report.

Show child attributes

livemode
boolean
Has the value true if the object exists in live mode or the value false if the object exists in test mode.


options
nullable object
Configuration options for this report.

Show child attributes

phone
nullable object
Result of the phone check for this report.

Show child attributes

selfie
nullable object
Result of the selfie check for this report.

Show child attributes

type
enum
Type of report.

Possible enum values
document
Perform a document check.

id_number
Perform an ID number check.

verification_flow
Configuration provided by verification flow


verification_flow
nullable string
The configuration token of a verification flow from the dashboard.


verification_session
nullable string
ID of the VerificationSession that created this report.

The VerificationReport object
{
  "id": "vr_1MwBlH2eZvKYlo2C91hOpFMf",
  "object": "identity.verification_report",
  "created": 1681337011,
  "livemode": false,
  "options": {
    "document": {}
  },
  "type": "document",
  "verification_session": "vs_NhaxYCqOE27AqaUTxbIZOnHw",
  "document": {
    "status": "verified",
    "error": null,
    "first_name": "Jenny",
    "last_name": "Rosen",
    "address": {
      "line1": "1234 Main St.",
      "city": "San Francisco",
      "state": "CA",
      "zip": "94111",
      "country": "US"
    },
    "type": "driving_license",
    "files": [
      "file_NhaxRCXT8Iuu8apSuci00UC4",
      "file_NhaxDeWKGAOTc8Uec7UY9Ljj"
    ],
    "expiration_date": {
      "month": 12,
      "day": 1,
      "year": 2025
    },
    "issued_date": {
      "month": 12,
      "day": 1,
      "year": 2020
    },
    "issuing_country": "US"
  }
}
Retrieve a VerificationReport 
Retrieves an existing VerificationReport

Parameters
No parameters.

Returns
Returns a VerificationReport object

GET 
/v1/identity/verification_reports/:id
Server-side language

cURL
curl https://api.stripe.com/v1/identity/verification_reports/vr_1MwBlH2eZvKYlo2C91hOpFMf \
  -u "sk_test_51Pye17HW5xgT0Q1XqWIoeoMbEn3OynAqYHNw6k5ty148s2o4oyveeoP3mJhXuBh6UMIbGPudEaUmemCTfjZ7XQ8600IqV97Fcf:"
Response
{
  "id": "vr_1MwBlH2eZvKYlo2C91hOpFMf",
  "object": "identity.verification_report",
  "created": 1681337011,
  "livemode": false,
  "options": {
    "document": {}
  },
  "type": "document",
  "verification_session": "vs_NhaxYCqOE27AqaUTxbIZOnHw",
  "document": {
    "status": "verified",
    "error": null,
    "first_name": "Jenny",
    "last_name": "Rosen",
    "address": {
      "line1": "1234 Main St.",
      "city": "San Francisco",
      "state": "CA",
      "zip": "94111",
      "country": "US"
    },
    "type": "driving_license",
    "files": [
      "file_NhaxRCXT8Iuu8apSuci00UC4",
      "file_NhaxDeWKGAOTc8Uec7UY9Ljj"
    ],
    "expiration_date": {
      "month": 12,
      "day": 1,
      "year": 2025
    },
    "issued_date": {
      "month": 12,
      "day": 1,
      "year": 2020
    },
    "issuing_country": "US"
  }
}
List VerificationReports 
List all verification reports.

Parameters

client_reference_id
string
A string to reference this user. This can be a customer ID, a session ID, or similar, and can be used to reconcile this verification with your internal systems.


created
object
Only return VerificationReports that were created during the given date interval.

Show child parameters

type
enum
Only return VerificationReports of this type

Possible enum values
document
Perform a document check.

id_number
Perform an ID number check.


verification_session
string
Only return VerificationReports created by this VerificationSession ID. It is allowed to provide a VerificationIntent ID.

More parameters
Expand all

ending_before
string

limit
integer

starting_after
string
Returns
List of VerificationInent objects that match the provided filter criteria.

GET 
/v1/identity/verification_reports
Server-side language

cURL
curl -G https://api.stripe.com/v1/identity/verification_reports \
  -u "sk_test_51Pye17HW5xgT0Q1XqWIoeoMbEn3OynAqYHNw6k5ty148s2o4oyveeoP3mJhXuBh6UMIbGPudEaUmemCTfjZ7XQ8600IqV97Fcf:" \
  -d limit=3
Response
{
  "object": "list",
  "url": "/v1/identity/verification_reports",
  "has_more": false,
  "data": [
    {
      "id": "vr_1MwBlH2eZvKYlo2C91hOpFMf",
      "object": "identity.verification_report",
      "created": 1681337011,
      "livemode": false,
      "options": {
        "document": {}
      },
      "type": "document",
      "verification_session": "vs_NhaxYCqOE27AqaUTxbIZOnHw",
      "document": {
        "status": "verified",
        "error": null,
        "first_name": "Jenny",
        "last_name": "Rosen",
        "address": {
          "line1": "1234 Main St.",
          "city": "San Francisco",
          "state": "CA",
          "zip": "94111",
          "country": "US"
        },
        "type": "driving_license",
        "files": [
          "file_NhaxRCXT8Iuu8apSuci00UC4",
          "file_NhaxDeWKGAOTc8Uec7UY9Ljj"
        ],
        "expiration_date": {
          "month": 12,
          "day": 1,
          "year": 2025
        },
        "issued_date": {
          "month": 12,
          "day": 1,
          "year": 2020
        },
        "issuing_country": "US"
      }
    }
  ]
}
