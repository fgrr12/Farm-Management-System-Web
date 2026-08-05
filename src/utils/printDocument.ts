/** Opens a self-contained HTML document in a new tab and focuses it — the shared mechanism
 *  behind every printable page in the app (tax cards, animal history, production summaries).
 *  The document itself is responsible for its own print button and @media print rules. */
export const openPrintWindow = (html: string): void => {
	const printWindow = window.open('', '_blank')
	if (!printWindow) return

	printWindow.document.write(html)
	printWindow.document.close()
	printWindow.focus()
}
