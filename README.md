# GeeksforGeeks RGIPT Work Manager

Welcome to the GeeksforGeeks RGIPT Work Manager! This document provides an overview and usage guidelines for the work manager system built using Google Apps Script for automation. This system integrates a Google Form and a Google Sheet to streamline task management and communication among team members.

## Overview

The GeeksforGeeks RGIPT Work Manager consists of two main components:
1. **Google Form** - For submitting tasks and related information.
2. **Google Sheet** - Linked to the form, used for managing and tracking tasks.

## Google Sheet Structure

### 1. General Sheet

**The General Sheet** is divided into two main parts:

- **Guidelines**: Contains Notion links to:
  - Learnings from the past year.
  - Responsibilities and hierarchy drive link.
  - Documentation for the work manager.

- **Team Info**: Lists email addresses of team members. 

**Important Notes:**
- **Editing Team Info**: Modifications to team members in the Team Info section reset all permissions. New permissions are automatically granted:
  - All members receive view access to all sheets.
  - Presidents/Vice Presidents receive editor access only to specific columns (C, F, G) in the board sheet:
    - Column C: Approved by Assignor Heads
    - Column F: Priority
    - Column G: Status
- **Permissions Management**: You do not need to manually adjust editor/viewer permissions. Changes in the Team Info section handle this automatically.
- **Sheet Structure**: Avoid changing the sheet structure to prevent functionality issues.

### 2. Board Sheet

The **Board Sheet** displays and tracks all tasks with the following sections:

1. **Assignor's Team**: Shows the team the assignor belongs to (from the Team Info section). If multiple teams are listed, the first team is displayed.
2. **Description**: Provides detailed information about the task for the assigned team.
3. **Approved by Heads**: A checkbox (default is false) indicating whether the task is approved by heads.
4. **Assigned Team**: Indicates the team to which the work is assigned.
5. **Deadline**: The date by which the task should be completed.
6. **Priority**: Task impact level (Low, Medium, High).
7. **Status**: Current status of the task (Waiting, Done, Backlog, Working, Review).
8. **Date Created**: The date the task was created.

## Google Form

**The Google Form** collects the following information:
- Email
- Assigned Team
- Description
- Deadline
- Priority

**Features:**
1. **Linkage**: The form and sheet are interconnected. Submissions automatically appear on the board.
2. **Visibility**: Tasks assigned to other teams are visible to all GFG RGIPT members.
3. **Email Requirement**: Form submissions must use the submitter’s own email ID.
4. **Date Format**: Dates are displayed in the format dd/mm/yyyy.
5. **Notification**: Upon form submission:
   - An email is sent to the assigned team to check the board.
   - An email is sent to the assignor’s team heads for approval.
6. **Approval Notifications**: Heads’ approval triggers an email to the assigned team members.
7. **Automatic Updates**: The board updates automatically based on form submissions.
8. **Reminder Emails**: Sent one day before a task's deadline.
9. **Status Editing**: Changing the status in the board sheet updates the background color.
10. **Row Deletion**: Rows marked as "Done" will be automatically deleted after 3 days.
11. **Deadline Monitoring**: Daily checks on deadlines; overdue tasks trigger emails to all presidents.

## Contribution Guidelines

We welcome contributions to improve the GeeksforGeeks RGIPT Work Manager! Please follow these guidelines to ensure smooth collaboration:

1. **Fork the Repository**: Start by forking the repository to your own GitHub account.
2. **Create a Branch**: Create a new branch for your changes. Use a descriptive name for your branch.
3. **Make Changes**: Implement your changes in the new branch. Ensure your changes follow the project’s coding standards and do not disrupt existing functionality.
4. **Test Your Changes**: Thoroughly test your changes to confirm they work as expected.
5. **Submit a Pull Request**: Once you are satisfied with your changes, submit a pull request. Provide a clear description of the changes and the rationale behind them.
6. **Review Process**: Your pull request will be reviewed by project maintainers. Be open to feedback and make any necessary revisions.
7. **Stay Updated**: Keep an eye on the project’s issues and discussions to stay informed about ongoing work and upcoming changes.

## Troubleshooting

1. If trigger does not correctly set editors and viewers. Go to a blank cell and hit delete/backspace. This will trigger the process again.
    # Reason: When editing the general sheet, a lot of onedit calls go to the server simultaneously.

For any issues or further assistance, feel free to reach out.
