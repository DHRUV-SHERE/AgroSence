/** Sell a crop (AppLayout). Wraps the listing form; on success goes to My listings. */
import { useNavigate } from 'react-router-dom'
import { Card, useToast } from '../components/ui'
import CropForm from '../components/marketaccess/CropForm'
import '../styles/pages-market.css'

export default function CropSell() {
  const navigate = useNavigate()
  const toast = useToast()
  return (
    <div className="ag-sellwrap">
      <div className="ag-pagehead">
        <div>
          <h1>Sell your <span className="ag-em">harvest</span></h1>
          <p>Add clear photos and an honest price. Buyers send you order requests; you decide which to accept.</p>
        </div>
      </div>
      <Card>
        <CropForm
          onSaved={(crop) => { toast.success(`${crop.cropName} is now listed for buyers.`, { title: 'Crop listed' }); navigate('/product') }}
          onCancel={() => navigate(-1)}
        />
      </Card>
    </div>
  )
}
