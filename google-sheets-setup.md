# Life Goals Progress Tracker in Google Sheets

This guide will help you set up a Life Goals Progress Tracker in Google Sheets, complete with formulas for streak tracking, conditional formatting, and basic analytics.

## Step 1: Set Up Your Sheet

1. Open Google Sheets and create a new spreadsheet.
2. Rename your spreadsheet to "Life Goals Progress Tracker".

## Step 2: Create Your Columns

In the first row, create the following headers:
- **Goal**: The specific goal you want to track.
- **Start Date**: The date you start working towards the goal.
- **End Date**: The date you aim to achieve the goal.
- **Progress**: A numerical representation of your progress (e.g., percentage).
- **Streak**: A formula to track your streak of consecutive days working towards the goal.
- **Notes**: Any additional notes regarding the goal.

For example:
```
| Goal                | Start Date | End Date   | Progress | Streak | Notes      |
|---------------------|------------|------------|----------|--------|------------|
| Read 12 books       | 01/01/2023 | 12/31/2023 | 0%       |        |            |
```

## Step 3: Input Your Goals

Fill in the rows with your specific life goals, start dates, end dates, and initial progress.

## Step 4: Streak Tracking

To track your streak of working on a goal, you can use the following formula in the **Streak** column (assuming your progress is recorded daily in a separate sheet):

```excel
=IF(A2="", "", COUNTIFS(Progress!A:A, A2, Progress!B:B, "Yes"))
```

Replace `Progress!A:A` with the appropriate range where you track daily progress.

## Step 5: Conditional Formatting

To visually represent your progress, you can set up conditional formatting:

1. Select the **Progress** column.
2. Go to `Format` > `Conditional formatting`.
3. Set the rules based on your progress percentage:
   - If the value is 100%, change the background to green.
   - If the value is between 50% and 99%, change it to yellow.
   - If the value is 0% to 49%, change it to red.

## Step 6: Basic Analytics

You can set up basic analytics to see your overall progress:

1. Create a new sheet named "Analytics".
2. Use the following formulas to summarize your goals:
   - **Total Goals**: `=COUNTA(Sheet1!A:A) - 1` (adjust the range accordingly)
   - **Goals Achieved**: `=COUNTIF(Sheet1!D:D, "100%")`
   - **Average Progress**: `=AVERAGE(Sheet1!D:D)`

## Conclusion

By following these steps, you'll have a comprehensive Life Goals Progress Tracker in Google Sheets that allows you to monitor your progress effectively. Customize it further to suit your needs!