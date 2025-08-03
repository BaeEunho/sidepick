# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SidePick (사이드픽) is a Korean dating service that matches people based on their political orientations. It's a static website with client-side JavaScript, designed to be hosted on simple web servers without backend requirements (currently).

## Architecture

### Core Components

1. **Political Test System** (`political-test.html`, `political-test-script.js`)
   - 60-question survey analyzing 4 axes: economic, social, cultural, and participation
   - Results in 16 political types (8 progressive, 8 conservative)
   - Test results stored in sessionStorage

2. **Authentication Flow** (`auth-check.js`)
   - Three user states: anonymous, authenticated, verified (completed test)
   - Session-based authentication using sessionStorage
   - No real backend - demo mode only

3. **Meeting System** (`meeting-schedule.html`, `schedule-script.js`)
   - Progressive and conservative meetings shown based on user orientation
   - Application tracking via sessionStorage (`appliedMeetings`)
   - Payment states: pending (입금 대기중) and confirmed (참가 확정)

4. **Payment Flow** (currently demo only)
   - `booking-confirm.html` → `payment.html` → `payment-complete.html`
   - Bank transfer info: 신한은행 110-386-140132 (배은호)
   - 45,000원 per meeting

## Key Technical Details

### State Management
- User data: `sessionStorage` (isLoggedIn, userEmail, userProfile, politicalType, userGender)
- Meeting applications: `appliedMeetings` object keyed by orientation (progressive/conservative)
- Test results: `testResultDetail`, `axisScores`, `userAnswers`

### Political Type Codes
Format: `[Gender][Economic][Social][Cultural][Participation]`
- Gender: M/G (Market/Government)
- Economic: P/C (Progressive/Conservative)
- Social: O/T (Open/Traditional)
- Participation: S/N (Social/elitist)
Example: MPOS = Market Progressive Open Social

### Important Business Rules
- Users can only apply to meetings matching their political orientation
- One meeting application per orientation at a time
- Refund policy: 100% if canceled 3+ days before, decreasing to 0% on event day
- Email for all business contacts: clsrna3@naver.com

## Development Commands

Since this is a static site, there are no build commands. To develop:

1. Serve files with any static server:
   ```bash
   # Python
   python -m http.server 8000
   
   # Node.js 
   npx http-server
   
   # VS Code
   Use Live Server extension
   ```

2. Clear test data:
   ```bash
   # In browser console
   sessionStorage.clear()
   ```

## Testing Scenarios

### Complete User Flow
1. Sign up with any email (demo mode)
2. Complete political test (60 questions)
3. View meeting schedule (auto-filtered by orientation)
4. Apply for meeting
5. Go through payment flow (demo only)

### Quick Testing
- Skip to any page by manually setting sessionStorage values
- Test all 16 political types by visiting `test-all-results.html`
- Check political type descriptions in `political-test-script.js` (resultTypes object)

## Common Issues

1. **"TypeError: AuthManager.setTestComplete is not a function"**
   - User hasn't completed the political test
   - Check if `politicalType` exists in sessionStorage

2. **Meetings not showing**
   - Check user's political orientation matches meeting orientation
   - Verify `appliedMeetings` structure in sessionStorage

3. **Payment not progressing**
   - Ensure all required sessionStorage values are set
   - Check browser console for missing data

## Future Production Requirements

See `실제결제구축가이드.md` for:
- Business registration requirements
- Payment gateway integration (Toss Payments)
- Server setup with SSL
- Database schema (`database-schema.sql`)
- Legal compliance checklist