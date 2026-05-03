
const EventAgenda = ({ agendaItems }: { agendaItems: string[] }) => {
  return (
    <div className="agenda">
      <h2>Agenda</h2>
      <ul>
        {agendaItems.map((item, idx: number) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
    </div>
  )
}

export default EventAgenda
