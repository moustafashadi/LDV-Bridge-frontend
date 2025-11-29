// ============================================
// PHASE 3 HOOKS - CENTRAL EXPORT
// ============================================

// Policy Engine Hooks (Task 12)
export {
  usePolicies,
  usePolicy,
  usePolicyMutations,
} from './use-policies';

// Notification System Hooks (Task 15)
export {
  useNotifications,
  useUnreadCount,
  useNotificationActions,
  useRealtimeNotifications,
} from './use-notifications';

// App Sync Service Hooks (Task 9)
export {
  useSyncStatus,
  useSyncHistory,
  useSyncActions,
} from './use-sync';

// Component Management Hooks (Task 10)
export {
  useComponents,
  useComponent,
  useComponentVersions,
  useComponentWithVersions,
  useComponentMutations,
} from './use-components';

// Change Detection Hooks (Task 11)
export {
  useChanges,
  useChange,
  useChangeDiff,
  useChangeImpact,
  useMyChanges,
  useChangeMutations,
} from './use-changes';

// Review Workflow Hooks (Task 14)
export {
  useReviews,
  useReview,
  useReviewWithComments,
  useReviewMetrics,
  useMyReviews,
  useComments,
  useReviewActions,
  useCommentActions,
} from './use-reviews';
