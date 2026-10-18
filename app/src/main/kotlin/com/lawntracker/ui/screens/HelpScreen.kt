package com.lawntracker.ui.screens

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.LinkAnnotation
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.TextLinkStyles
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.withLink
import androidx.compose.ui.unit.dp

const val HELP_TEXT_MD = """
## Support
As the app is free software and I am a hobbyist, I have limited time to support different use cases. However, please private message me [on GitHub](https://github.com/nick42d), and I will help where I can.
## Lodging issues
Issues, bugs and feature requests can be [logged on GitHub](https://github.com/nick42d/LawnTrackerApp/issues).
## Types of trackers
There are 3 currently implemented tracker types.
- GDD: A GDD (Growing Degree Day) tracker is designed to keep track of lawn tasks that are growing degree sensitive (for example PGR application). You will get a notification when the GDD target has been reached. When the product is re-applied, you can Reset the tracker to set the start date to the current date.
- Timed: A timed tracker is designed to keep track of lawn tasks that are periodic (for example fertiliser application). You will get a notification when the duration has been met. When the product is re-applied, you can Reset the tracker to set the start date to the current date.
- Calendar: A calendar tracker is designed to keep track of infrequent tasks that occur on a certain date (for example renovation). You will get a notification on the date.
## Information about GDD Trackers
### Projection types 
There are 3 methods used to calculated a projected GDD target date.
- Historical: Based on historical weather data, the GDD target was met on the historical date.
- Forecast: Based on historical weather data and/or weather forecasts, the GDD target will be met on the forecasted date.
- Estimated: The GDD target will be met beyond the latest weather forecast. An average of historical and forecasted weather is used to project the estimated date.
### GDD algorithm
There are two varieties of GDD algorithm to use. Please see [the Wikipedia article on Growing Degree Days](https://en.wikipedia.org/wiki/Growing_degree-day) for more details.
### Base temp
Base temp is dependant on the grass variety, for example, cool seasons grasses generally see growth at the lower temperature.
## License
This app is free software licensed under the GPL v2 license.
Weather data by [Open-Meteo.com](https://www.open-meteo.com)
"""

@Composable
fun HelpScreen() {
    val primaryColor = MaterialTheme.colorScheme.primary
    val onBackground = MaterialTheme.colorScheme.onBackground

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 20.dp, vertical = 12.dp),
    ) {
        val lines = HELP_TEXT_MD.trim().lines()
        lines.forEach { rawLine ->
            val line = rawLine.trim()
            when {
                line.startsWith("### ") -> {
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = line.removePrefix("### "),
                        style = MaterialTheme.typography.titleMedium,
                        color = onBackground,
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                }
                line.startsWith("## ") -> {
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = line.removePrefix("## "),
                        style = MaterialTheme.typography.titleLarge,
                        color = onBackground,
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                }
                line.startsWith("- ") -> {
                    MarkdownTextLine(
                        text = "• " + line.removePrefix("- "),
                        linkColor = primaryColor,
                        bodyColor = onBackground,
                        modifier = Modifier.padding(start = 8.dp, bottom = 4.dp),
                    )
                }
                line.isNotEmpty() -> {
                    MarkdownTextLine(
                        text = line,
                        linkColor = primaryColor,
                        bodyColor = onBackground,
                        modifier = Modifier.padding(bottom = 4.dp),
                    )
                }
            }
        }
    }
}

private val markdownLinkRegex = Regex("""\[([^\]]+)]\(([^)]+)\)""")

@Composable
private fun MarkdownTextLine(
    text: String,
    linkColor: androidx.compose.ui.graphics.Color,
    bodyColor: androidx.compose.ui.graphics.Color,
    modifier: Modifier = Modifier,
) {
    val annotated = buildAnnotatedString {
        var lastIndex = 0
        for (match in markdownLinkRegex.findAll(text)) {
            if (match.range.first > lastIndex) {
                append(text.substring(lastIndex, match.range.first))
            }
            val label = match.groupValues[1]
            val url = match.groupValues[2]
            withLink(
                LinkAnnotation.Url(
                    url = url,
                    styles = TextLinkStyles(
                        style = SpanStyle(
                            color = linkColor,
                            textDecoration = TextDecoration.Underline,
                        ),
                    ),
                ),
            ) {
                append(label)
            }
            lastIndex = match.range.last + 1
        }
        if (lastIndex < text.length) {
            append(text.substring(lastIndex))
        }
    }
    Text(
        text = annotated,
        style = MaterialTheme.typography.bodyMedium,
        color = bodyColor,
        modifier = modifier,
    )
}
