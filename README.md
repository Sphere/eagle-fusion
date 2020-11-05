# Fusion

//Comment by Shyam
Initialization Code:

If Authenticated:

Get Roles, Get Groups, Get Features, Get WidgetConfigs
Process Features by roles & Groups
Process Widgets by features, roles and groups
Initialize Widgets by widgetConfig => Reset the available Flow of static injection
Process featuesList.json by using roles & groups

Features =>
check if its available

- No -> check if is denied or not available
- Yes -> check for current page rendering
  -> Yes => render
  -> No => stop rendering
