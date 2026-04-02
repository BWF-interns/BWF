# BWF Mobile App

Flutter-based mobile application for students and wardens under the Borderless World Foundation.

This application enables profile management, activity logging, expense viewing, moderated community interaction, and offline-first synchronization.

## Overview

`bwf-mobile-app` is the mobile client of the Borderless World Foundation Student & Staff Management System.

It is designed primarily for:

* Students
* Wardens

The app connects to the `bwf-backend` REST API and supports offline data storage with background synchronization.

## Core Features

### Authentication

* Secure login using JWT
* Role-based access (Student / Warden)
* Token refresh handling

### Student Features

* View and edit limited profile details
* Update interests
* Log daily activities
* View personal expense summaries
* Create community posts (approval required)
* View approved community posts

### Warden Features

* Create and verify student accounts
* View and manage assigned students
* Add student expenses
* Review activity logs
* Approve or reject community posts
* Moderate assigned region/hostel

## Offline-First Architecture

The app is designed to function in low-connectivity environments.

### Local Storage

* Data cached locally when offline
* Background sync mechanism

### Sync Strategy

Each record contains:

* `is_synced` (boolean)
* `last_modified_timestamp`

Sync flow:

1. User performs action offline
2. Data stored locally
3. Added to sync queue
4. Automatically synchronized when internet is available

## Role-Based Access Control

Role validation is enforced at two levels:

1. Frontend role-based UI rendering
2. Backend role validation (source of truth)

Students cannot:

* Access other students’ data
* Approve posts
* Modify warden-created expenses

Wardens cannot:

* Access organization-wide financial data
* Access admin-level configuration

## Technology Stack

* Flutter
* Dart
* REST API integration
* JWT Authentication
* Local storage
* Background synchronization logic

## Suggested Project Structure

```
lib/
 ├── main.dart
 ├── core/
 │     ├── constants/
 │     ├── utils/
 │     └── services/
 ├── features/
 │     ├── auth/
 │     ├── students/
 │     ├── activities/
 │     ├── expenses/
 │     ├── community/
 ├── models/
 ├── providers/ or bloc/
 ├── routes/
 └── local_storage/
```

## Installation

```
flutter pub get
flutter run
```

For release build:

```
flutter build apk
```

## Integration Requirements

* `bwf-backend` must be running
* Valid JWT authentication endpoints
* Proper role-based API routes

## Security Considerations

* Secure token storage (do not store plain text tokens insecurely)
* Always validate permissions server-side
* Encrypt sensitive local storage if required
* Validate sync conflicts using timestamps
