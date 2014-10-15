<div class="container-fluid">
	<h1>Look Who's Here!</h1>
	<table class="table" id="report">
		<thead>
			<tr>
				<th>Class</th>
				<th>Name</th>
				<th>Maiden Name</th>
				<th>School</th>
			</tr>
		</thead>
		<tbody>
			<?php foreach ($rows as $year => $alums): ?>
				<?php for ($i = 0, $count = count($alums); $i < $count; $i++): ?>
					<?php if ($i === 0): ?>
						<tr class="report-group">
						<td class="report-year"><?php echo $year; ?></td>
					<?php else: ?>
						<tr>
						<td></td>
					<?php endif; ?>
					<td><?php echo $alums[$i]['name']; ?></td>
					<td><?php echo $alums[$i]['maiden_name']; ?></td>
					<td><?php echo $alums[$i]['schools']; ?></td>
					</tr>
				<?php endfor; ?>
			<?php endforeach; ?>
		</tbody>
	</table>
</div>